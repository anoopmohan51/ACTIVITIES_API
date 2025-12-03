import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { Experience } from '../models/Experience';
import { Category } from '../models/Category';
import { Season } from '../models/Season';
import { ExperienceImage } from '../models/ExperienceImage';
import { ExperiencePDF } from '../models/ExperiencePDF';
import { ExperienceVideo } from '../models/ExperienceVideo';
import { ApprovalLogs } from '../models/ApprovalLogs';
import { ApprovalLevels } from '../models/ApprovalLevels';
import { LevelMapping } from '../models/LevelMapping';
import { handleErrorResponse, handleSuccessResponse } from '../utils/response.handler';
import { handleVideoUpload } from '../utils/video.handler';
import { handleImagesUpload } from '../utils/image.handler';
import { handlePDFsUpload } from '../utils/pdf.handler';

const router: Router = express.Router();

/**
 * Normalize price string to remove unnecessary decimal formatting
 * Converts "11.00" to "11", but preserves "11.50" as "11.50"
 */
const normalizePrice = (price: any): string | undefined => {
    if (price === undefined || price === null || price === '') {
        return undefined;
    }
    const priceStr = String(price).trim();
    if (!priceStr) return undefined;
    
    const num = parseFloat(priceStr);
    if (isNaN(num)) {
        return priceStr; // Return as-is if not a valid number
    }
    
    // If it's a whole number, return without decimal point
    return num % 1 === 0 ? String(Math.floor(num)) : priceStr;
};

interface ErrorResponse {
    statusCode?: number;
    message?: string;
    name?: string;
    errors?: any[];
}

interface ExperienceWithRelations extends Omit<Experience, 'category' | 'season'> {
    category?: {
        id: number;
        name: string;
    };
    season?: {
        id: number;
        name: string;
    };
}

/**
 * @route POST /api/experience
 * @desc Create a new experience
 */
router.post('/', async (req, res) => {
    try {
        // Debug logging for form-data
        // No file handling in this route
        
        // Get form data
        const formData: Record<string, any> = req.body;
        
        // Check if form data exists
        if (!req.body || Object.keys(req.body).length === 0) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Form data is missing',
                errors: [{
                    path: 'form',
                    message: 'Form fields are required'
                }]
            });
        }

        // Create the experience object from form-data
        const experienceData = {
            // Required fields with proper type conversion
            site_id: formData.site_id || undefined,
            company_id: formData.company_id || undefined,
            created_user: formData.created_user || undefined,
            updated_user: formData.updated_user || undefined,
            is_delete: formData.is_delete === 'true',
            name: formData.name || 'Untitled Experience',
            status: 'draft',

            // Boolean fields
            isExcursion: formData.isExcursion === 'true',
            isGuided: formData.isGuided === 'true',
            isPickupServiceAvailable: formData.isPickupServiceAvailable === 'true',

            // Number fields
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
            seasonId: formData.seasonId ? parseInt(formData.seasonId) : undefined,
            department_id: formData.department_id || undefined,
            minimumParticipant: formData.minimumParticipant ? parseInt(formData.minimumParticipant) : undefined,
            maximumParticipant: formData.maximumParticipant ? parseInt(formData.maximumParticipant) : undefined,
            numberOfPersons: formData.numberOfPersons ? parseInt(formData.numberOfPersons) : undefined,

            // Array fields - parse JSON strings if needed
            operatingDays: formData.operatingDays ? (typeof formData.operatingDays === 'string' ? JSON.parse(formData.operatingDays) : formData.operatingDays) : undefined,
            tags: formData.tags ? (typeof formData.tags === 'string' ? JSON.parse(formData.tags) : formData.tags) : undefined,
            whatsIncluded: formData.whatsIncluded ? (typeof formData.whatsIncluded === 'string' ? JSON.parse(formData.whatsIncluded) : formData.whatsIncluded) : undefined,
            whatsExcluded: formData.whatsExcluded ? (typeof formData.whatsExcluded === 'string' ? JSON.parse(formData.whatsExcluded) : formData.whatsExcluded) : undefined,

            // Text fields with null handling
            location: formData.location || undefined,
            difficultyLevel: formData.difficultyLevel || undefined,
            duration: formData.duration || undefined,
            video: formData.video || undefined,
            guideType: formData.guideType || undefined,
            noOfGuides: formData.noOfGuides || undefined,
            travellMedium: formData.travellMedium || undefined,
            prefferedTime: formData.prefferedTime || undefined,
            whatWillYouDo: formData.whatWillYouDo || undefined,
            whatYouWillExperience: formData.whatYouWillExperience || undefined,
            experienceHighlights: formData.experienceHighlights || undefined,
            stepByStepItinerary: formData.stepByStepItinerary || undefined,
            whoCanParticipate: formData.whoCanParticipate || undefined,
            whatToWear: formData.whatToWear || undefined,
            rulesAndRegulation: formData.rulesAndRegulation || undefined,
            carriableItems: formData.carriableItems || undefined,
            pickupServiceDetails: formData.pickupServiceDetails || undefined,
            cancellationPolicy: formData.cancellationPolicy || undefined,
            safetyProtocols: formData.safetyProtocols || undefined,
            additionalInformation: formData.additionalInformation || undefined,
            termsAndConditions: formData.termsAndConditions || undefined,
            costBreakdown: formData.costBreakdown || undefined,
            billingInstructions: formData.billingInstructions || undefined,
            price: normalizePrice(formData.price),

        };
        


        // Validate required fields
        if (!experienceData.site_id) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'site_id is required',
                errors: [{
                    path: 'site_id',
                    message: 'site_id field is missing'
                }]
            });
        }

        // Create the experience
        const experience = await Experience.create(experienceData);
        
        // Create approval log entry
        try {
            await ApprovalLogs.create({
                experience_id: experience.id,
                company_id: experienceData.company_id || null,
                site_id: experienceData.site_id || null,
                current_level: 0,
                previous_level: null,
                approved_by: null,
                status: experienceData.status || 'draft',
                action: 'created'
            });
        } catch (logError) {
            // Continue even if approval log creation fails
        }
        
        // Initialize empty arrays for media URLs
        experience.imagesUrl = [];
        experience.videosUrl = null as any;


        // Handle file uploads if provided
        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            
            // Handle video upload
            if (files.video && files.video[0]) {
                try {
                    const videoRecord = await handleVideoUpload(files.video[0], experience.id);
                    if (videoRecord) {
                        await experience.update({ videosUrl: videoRecord.path });
                        experience.videosUrl = videoRecord.path; // Update the instance for response
                    }
                } catch (uploadError) {
                    // Continue with the response even if video upload fails
                }
            }


            if (files.images && files.images.length > 0) {
                try {
                    const imageRecords = await handleImagesUpload(files.images, experience.id);
                    
                    // Get image paths and update experience
                    const imagePaths = imageRecords.map(record => record.path);
                    await experience.update({ imagesUrl: imagePaths });
                    experience.imagesUrl = imagePaths; // Update the instance for response
                } catch (uploadError) {
                    // Continue with the response even if image upload fails
                }
            }

            // Handle PDF upload
            if (files.pdfs && files.pdfs.length > 0) {
                try {
                    await handlePDFsUpload(files.pdfs, experience.id);
                } catch (uploadError) {
                    // Continue with the response even if PDF upload fails
                }
            }
        }

        return handleSuccessResponse(res, {
            message: 'Experience created successfully',
            data: experience
        });

    } catch (error: unknown) {
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('undefined')) {
                return handleErrorResponse(res, {
                    statusCode: 400,
                    message: 'Invalid form data. Please check your request format and try again.',
                    errors: [{
                        path: 'form',
                        message: error.message
                    }]
                });
            }
            
            return handleErrorResponse(res, {
                statusCode: 500,
                message: error.message,
                errors: [{
                    path: 'server',
                    message: error.message
                }]
            });
        }
        
        return handleErrorResponse(res, {
            statusCode: 500,
            message: 'Internal server error',
            errors: [{
                path: 'server',
                message: 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route GET /api/experience/:id
 * @desc Get a single experience by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const experienceId = parseInt(req.params.id);

        // Get experience with all related data
        const experience = await Experience.findOne({
            where: {
                id: experienceId,
                is_delete: false // Only get non-deleted experiences
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name']
                },
                {
                    model: ExperienceImage,
                    as: 'images',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperiencePDF,
                    as: 'pdfs',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperienceVideo,
                    as: 'videos',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                }
            ]
        });

        if (!experience) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: 'Experience not found',
                errors: [{
                    path: 'id',
                    message: 'Experience not found or has been deleted'
                }]
            });
        }

        // Get image URLs from the related images
        const imageUrls = experience.images?.map(img => img.path) || [];
        // Get PDF data from the related PDFs (including path and uploaded file name)
        const pdfsData = (experience as any).pdfs?.map((pdf: ExperiencePDF) => ({
            id: pdf.id,
            path: pdf.path,
            name: pdf.name,
            uploaded_file_name: pdf.uploaded_file_name
        })) || [];
        
        // Extract uploaded PDF names
        const uploadedPdfNames = pdfsData.map((pdf: any) => pdf.uploaded_file_name).filter((name: string | null) => name !== null);

        // Get video URL from the related videos (use first video if exists, otherwise null)
        const videos = (experience as any).videos || [];
        const videoUrl = videos.length > 0 ? videos[0].path : null;

        // Prepare response data
        const experienceJson = experience.toJSON();
        const responseData = {
            ...experienceJson,
            videosUrl: videoUrl,
            imagesUrl: imageUrls,
            pdfsUrl: pdfsData.map((pdf: any) => pdf.path), // Keep pdfsUrl for backward compatibility
            pdfs_name: pdfsData, // Include full PDF data with uploaded file names
            uploaded_pdf_name: uploadedPdfNames, // Array of uploaded PDF file names
            price: normalizePrice(experienceJson.price),
            category_name: (experience as any).category?.name || null,
            season_name: (experience as any).season?.name || null,
            // Remove nested relations from the response
            images: undefined,
            videos: undefined,
            pdfs: undefined
        };

        return handleSuccessResponse(res, {
            message: 'Experience retrieved successfully',
            data: responseData
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route GET /api/experience/site/:siteId
 * @desc List experiences by site_id
 */
/**
 * @route DELETE /api/experience/:id
 * @desc Soft delete an experience by setting is_delete=true
 */
router.delete('/:id', async (req, res) => {
    try {
        const experienceId = parseInt(req.params.id);

        // Find the experience
        const experience = await Experience.findByPk(experienceId);

        if (!experience) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: 'Experience not found',
                errors: [{
                    path: 'id',
                    message: 'Experience with the provided ID does not exist'
                }]
            });
        }

        // Check if already deleted
        if (experience.is_delete) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Experience already deleted',
                errors: [{
                    path: 'id',
                    message: 'Experience has already been marked as deleted'
                }]
            });
        }

        // Soft delete by setting is_delete=true
        await experience.update({
            is_delete: true,
            updated_user: experience.updated_user, // Preserve the last updated user
            updatedAt: new Date() // Update the timestamp
        });

        return handleSuccessResponse(res, {
            message: 'Experience deleted successfully',
            data: {
                id: experienceId,
                is_delete: true
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route PUT /api/experience/:id
 * @desc Update an experience
 */
router.put('/:id', async (req, res) => {
    try {
        
        const experienceId = parseInt(req.params.id);
        
        // Find the experience
        const experience = await Experience.findByPk(experienceId);
        if (!experience) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: 'Experience not found',
                errors: [{
                    path: 'id',
                    message: 'Experience with the provided ID does not exist'
                }]
            });
        }

        // Get form data
        const formData: Record<string, any> = req.body;
        
        
        // Create the experience object from form-data
        const experienceData = {
            // Required fields with proper type conversion
            updated_user: formData.updated_user || experience.updated_user,
            is_delete: false,
            name: formData.name || experience.name,
            status: formData.status,

            // Boolean fields
            isExcursion: formData.isExcursion === 'true',
            isGuided: formData.isGuided === 'true' || experience.isGuided,
            isPickupServiceAvailable: formData.isPickupServiceAvailable === 'true' || experience.isPickupServiceAvailable,

            // Number fields
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : experience.categoryId,
            seasonId: formData.seasonId ? parseInt(formData.seasonId) : experience.seasonId,
            minimumParticipant: formData.minimumParticipant === "null" || formData.minimumParticipant === null ? null as any : (formData.minimumParticipant ? parseInt(formData.minimumParticipant) : undefined),
            maximumParticipant: formData.maximumParticipant === "null" || formData.maximumParticipant === null ? null as any : (formData.maximumParticipant ? parseInt(formData.maximumParticipant) : undefined),
            numberOfPersons: formData.numberOfPersons === "null" || formData.numberOfPersons === null ? null as any : (formData.numberOfPersons ? parseInt(formData.numberOfPersons) : undefined),

            // Array fields - parse JSON strings if needed
            operatingDays: formData.operatingDays ? 
                (typeof formData.operatingDays === 'string' ? JSON.parse(formData.operatingDays) : formData.operatingDays) 
                : experience.operatingDays,
            tags: formData.tags ? 
                (typeof formData.tags === 'string' ? JSON.parse(formData.tags) : formData.tags) 
                : experience.tags,
            whatsIncluded: formData.whatsIncluded ? 
                (typeof formData.whatsIncluded === 'string' ? JSON.parse(formData.whatsIncluded) : formData.whatsIncluded) 
                : experience.whatsIncluded,
            whatsExcluded: formData.whatsExcluded ? 
                (typeof formData.whatsExcluded === 'string' ? JSON.parse(formData.whatsExcluded) : formData.whatsExcluded) 
                : experience.whatsExcluded,

            // Text fields with null handling
            location: formData.location,
            difficultyLevel: formData.difficultyLevel,
            duration: formData.duration,
            guideType: formData.guideType,
            noOfGuides: formData.noOfGuides,
            travellMedium: formData.travellMedium,
            prefferedTime: formData.prefferedTime,
            whatWillYouDo: formData.whatWillYouDo,
            whatYouWillExperience: formData.whatYouWillExperience,
            experienceHighlights: formData.experienceHighlights,
            stepByStepItinerary: formData.stepByStepItinerary,
            whoCanParticipate: formData.whoCanParticipate,
            whatToWear: formData.whatToWear,
            rulesAndRegulation: formData.rulesAndRegulation,
            carriableItems: formData.carriableItems,
            pickupServiceDetails: formData.pickupServiceDetails,
            cancellationPolicy: formData.cancellationPolicy,
            safetyProtocols: formData.safetyProtocols,
            additionalInformation: formData.additionalInformation,
            termsAndConditions: formData.termsAndConditions,
            costBreakdown: formData.costBreakdown,
            billingInstructions: formData.billingInstructions,
            department_id: formData.department_id || experience.department_id,
            price: normalizePrice(formData.price),
        };


        // Update basic fields
        await experience.update(experienceData);
        

        // Handle file uploads if provided - only save files, don't delete existing
        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            
            // Handle video upload - only if video exists in payload
            if (files.video && files.video[0] && files.video[0].size > 0) {
                try {
                    const videoRecord = await handleVideoUpload(files.video[0], experience.id);
                    if (videoRecord) {
                        await experience.update({ videosUrl: videoRecord.path });
                        experience.videosUrl = videoRecord.path;
                    }
                } catch (uploadError) {
                    // Continue even if video upload fails
                }
            }

            // Handle image uploads - only if images exist in payload
            if (files.images && files.images.length > 0) {
                // Filter out invalid images (like /path/to/file)
                const validImages = files.images.filter(img => {
                    return img.originalname !== 'file' && img.size > 0;
                });

                if (validImages.length > 0) {
                    try {
                        await handleImagesUpload(validImages, experience.id);
                    } catch (uploadError) {
                        // Continue even if image upload fails
                    }
                }
            }

            // Handle PDF upload - only if PDFs exist in payload
            if (files.pdfs && files.pdfs.length > 0) {
                // Filter out invalid PDFs
                const validPDFs = files.pdfs.filter(pdf => {
                    return pdf.originalname !== 'file' && pdf.size > 0 && pdf.mimetype === 'application/pdf';
                });

                if (validPDFs.length > 0) {
                    try {
                        await handlePDFsUpload(validPDFs, experience.id);
                    } catch (uploadError) {
                        // Continue even if PDF upload fails
                    }
                }
            }
        }

        // Get the latest image records
        const latestImages = await ExperienceImage.findAll({
            where: { experience_id: experienceId }
        });
        const imageUrls = latestImages.map(img => img.path);
        
        // Get the latest PDF records
        const latestPDFs = await ExperiencePDF.findAll({
            where: { experience_id: experienceId }
        });
        const pdfUrls = latestPDFs.map(pdf => pdf.path);
        const pdfsData = latestPDFs.map(pdf => ({
            id: pdf.id,
            path: pdf.path,
            name: pdf.name,
            uploaded_file_name: pdf.uploaded_file_name
        }));
        const uploadedPdfNames = pdfsData.map((pdf: any) => pdf.uploaded_file_name).filter((name: string | null) => name !== null);

        // Get the latest video records
        const latestVideos = await ExperienceVideo.findAll({
            where: { experience_id: experienceId }
        });
        const videoUrl = latestVideos.length > 0 ? latestVideos[0].path : null;

        // Get category and season data
        const updatedExperience = await Experience.findByPk(experienceId, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!updatedExperience) {
            throw new Error('Failed to fetch updated experience');
        }

        // Prepare response data with the latest media URLs and flatten category/season
        const experienceJson = updatedExperience.toJSON();
        const responseData = {
            ...experienceJson,
            videosUrl: videoUrl || null,
            imagesUrl: imageUrls, // Use the directly fetched image URLs
            pdfsUrl: pdfUrls, // Use the directly fetched PDF URLs
            pdfs_name: pdfsData, // Include full PDF data with uploaded file names
            uploaded_pdf_name: uploadedPdfNames, // Array of uploaded PDF file names
            price: normalizePrice(experienceJson.price),
            category_name: (updatedExperience as any).category?.name || null,
            season_name: (updatedExperience as any).season?.name || null,
            // Remove nested relations from the response
            images: undefined,
            pdfs: undefined,
            videos: undefined,
            category: undefined,
            season: undefined
        };


        return handleSuccessResponse(res, {
            message: 'Experience updated successfully',
            data: responseData
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return handleErrorResponse(res, {
                statusCode: 500,
                message: error.message,
                errors: [{
                    path: 'server',
                    message: error.message
                }]
            });
        }
        
        return handleErrorResponse(res, {
            statusCode: 500,
            message: 'Internal server error',
            errors: [{
                path: 'server',
                message: 'An unexpected error occurred'
            }]
        });
    }
});

router.get('/site/:siteId', async (req, res) => {
    try {
        const siteId = req.params.siteId;

        // Fetch experiences for the site with their relations
        const experiences = await Experience.findAll({
            where: {
                site_id: siteId,
                is_delete: false
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']], // Most recent first
            raw: true,
            nest: true
        }) as unknown as ExperienceWithRelations[];

        // Check if no experiences found
        if (!experiences || experiences.length === 0) {
            return handleSuccessResponse(res, {
                message: 'No experiences found for this site',
                data: [] // Return empty array instead of null
            });
        }

        // Format each experience in the response
        const formattedExperiences = experiences.map((experience: any) => {
            const formatted = {
                ...experience,
                price: normalizePrice(experience.price),
                category: experience.category?.id || null,
                category_name: experience.category?.name || null,
                season: experience.season?.id || null,
                season_name: experience.season?.name || null
            };

            // Remove the nested objects
            delete formatted.category;
            delete formatted.season;

            return formatted;
        });

        return handleSuccessResponse(res, {
            message: 'Experiences retrieved successfully',
            data: formattedExperiences
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error'
        } as ErrorResponse);
    }
});

/**
 * @route POST /api/experience/filter
 * @desc Filter experiences by status and category
 */
router.post('/filter', async (req, res) => {
    try {
        // Get pagination from query params
        const limit = parseInt(req.query.limit as string) || 10;  // Default limit to 10
        const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0
        
        // Get filters from request body
        const { status, categoryId ,site_id,company_id,current_approval_level,user_id,seasonId} = req.body;
        // Build where clause
        const whereClause: any = {
            is_delete: false, // Always exclude deleted records
            // site_id: req.query.property_id as string
        };
        
        // Apply common filters
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        if (site_id) {
            whereClause.site_id = site_id;
        }
        if (company_id) {
            whereClause.company_id = company_id;
        }
        if (current_approval_level) {
            whereClause.current_approval_level = current_approval_level;
        }
        if (seasonId){
            whereClause.seasonId=seasonId
        }
        
        // Handle status filter with user_id restriction
        if (user_id) {
            if (status === 'draft') {
                // If filtering for drafts, only show drafts created by this user
                whereClause.status = 'draft';
                whereClause.created_user = user_id;
            } else if (status) {
                // If filtering for a specific status (not draft), show all experiences with that status
                whereClause.status = status;
            } else {
                // If no status filter, use OR condition: drafts by user OR all non-drafts
                const orConditions: any[] = [
                    {
                        status: 'draft',
                        created_user: user_id  // Only show drafts created by this user
                    },
                    {
                        status: { [Op.ne]: 'draft' }  // Show all non-draft experiences
                    }
                ];
                whereClause[Op.or] = orConditions;
            }
        } else {
            // If no user_id, use normal filtering
            if (status) {
                whereClause.status = status;
            }
        }

        // Fetch filtered experiences with their relations and total count
        const { count, rows: experiences } = await Experience.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: ExperienceImage,
                    as: 'images',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperiencePDF,
                    as: 'pdfs',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperienceVideo,
                    as: 'videos',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                }
            ],
            order: [['createdAt', 'DESC']] // Most recent first
        });

        // Check if no experiences found
        if (!experiences || experiences.length === 0) {
            return handleSuccessResponse(res, {
                message: 'No experiences found with the given filters',
                data: [] // Return empty array instead of null
            });
        }

        // Format experiences using the common response format
        const formattedExperiences = experiences.map(experience => {
            // Get image URLs from the related images
            const imageUrls = experience.images?.map(img => img.path) || [];
            // Get PDF data from the related PDFs
            const pdfsData = (experience as any).pdfs?.map((pdf: ExperiencePDF) => ({
                id: pdf.id,
                path: pdf.path,
                name: pdf.name,
                uploaded_file_name: pdf.uploaded_file_name
            })) || [];
            const pdfUrls = pdfsData.map((pdf: any) => pdf.path);
            const uploadedPdfNames = pdfsData.map((pdf: any) => pdf.uploaded_file_name).filter((name: string | null) => name !== null);

            // Get video URL from the related videos (use first video if exists, otherwise null)
            const videos = (experience as any).videos || [];
            const videoUrl = videos.length > 0 ? videos[0].path : null;

            // Prepare response data
            const experienceJson = experience.toJSON();
            const responseData = {
                ...experienceJson,
                videosUrl: videoUrl,
                imagesUrl: imageUrls,
                pdfsUrl: pdfUrls,
                pdfs_name: pdfsData, // Include full PDF data with uploaded file names
                uploaded_pdf_name: uploadedPdfNames, // Array of uploaded PDF file names
                price: normalizePrice(experienceJson.price),
                category_name: (experience as any).category?.name || null,
                season_name: (experience as any).season?.name || null,
                // Remove nested relations from the response
                images: undefined,
                pdfs: undefined,
                videos: undefined,
                category: undefined,
                season: undefined
            };

            return responseData;
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        return handleSuccessResponse(res, {
            message: 'Experiences retrieved successfully',
            data: {
                experiences: formattedExperiences,
                pagination: {
                    total: count,
                    totalPages,
                    currentPage,
                    limit: Number(limit),
                    offset: Number(offset)
                }
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route PATCH /api/experience/:id/approve
 * @desc Update experience approval status
 */
router.patch('/:id', async (req, res) => {
    try {
        const experienceId = parseInt(req.params.id);
        const { status, approved_by, reason_for_reject } = req.body;

        // Validate required fields
        if (!status) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Status is required',
                errors: [{
                    path: 'status',
                    message: 'Status field is required'
                }]
            });
        }

        if (!approved_by) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Approved by (user_id) is required',
                errors: [{
                    path: 'approved_by',
                    message: 'approved_by field is required'
                }]
            });
        }
        
        // Find the experience
        const experience = await Experience.findByPk(experienceId);
        
        if (!experience) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: 'Experience not found',
                errors: [{
                    path: 'id',
                    message: 'Experience with the provided ID does not exist'
                }]
            });
        }

        // Store previous level
        const previousLevel = experience.current_approval_level || 0;
        let newApprovalLevel = previousLevel;
        let action = 'submitted';

        // Only increment approval level if status is not 'published'
        if (status !== 'published') {
            newApprovalLevel = previousLevel + 1;
        }
            
        //     // Get the next approval level from approval_levels table
        //     const approvalLevel = await ApprovalLevels.findOne({
        //         where: {
        //             company_id: experience.company_id,
        //             is_delete: false,
        //             level: newApprovalLevel
        //         },
        //         order: [['level', 'ASC']]
        //     });

        //     if (!approvalLevel && status !== 'rejected') {
        //         return handleErrorResponse(res, {
        //             statusCode: 404,
        //             message: 'No approval levels configured for this company',
        //             errors: [{
        //                 path: 'approval_levels',
        //                 message: 'Approval levels not found for this company'
        //             }]
        //         });
        //     }
        // }

        // Determine the action based on status
        if (status === 'rejected') {
            action = 'rejected';
            newApprovalLevel = 0;
        } else if (status === 'published') {
            action = 'published';
            // Keep current level when published
            newApprovalLevel = previousLevel;
        } else if (status === 'approved') {
            action = 'approved';
        }
        // Update experience with new status and approval level
        await experience.update({
            status: status,
            current_approval_level: newApprovalLevel,
        });

        // Create approval log entry
        await ApprovalLogs.create({
            experience_id: experienceId,
            company_id: experience.company_id,
            site_id: experience.site_id,
            current_level: newApprovalLevel,
            previous_level: previousLevel,
            approved_by: approved_by,
            status: status,
            action: action,
            reason_for_reject: status === 'rejected' ? reason_for_reject : null
        });

        // Get updated experience with relations
        const updatedExperience = await Experience.findByPk(experienceId, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name']
                }
            ]
        });

        return handleSuccessResponse(res, {
            message: `Experience ${action} successfully`,
            data: {
                id: experienceId,
                status: status,
                current_approval_level: newApprovalLevel,
                previous_level: previousLevel,
                experience: updatedExperience
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route POST /api/experience/approval/filter
 * @desc Filter experiences for approval based on user levels
 */
router.post('/approval/filter', async (req, res) => {
    try {
        // Get pagination from query params
        const limit = parseInt(req.query.limit as string) || 10;  // Default limit to 10
        const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0
        const is_published = req.query.is_published as string || "false";
        
        const { user_id, usergroup, filter } = req.body;

        // Validate required fields
        const hasValidUsergroup = usergroup && (Array.isArray(usergroup) ? usergroup.length > 0 : true);
        
        if (!user_id && !hasValidUsergroup) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Either user_id or usergroup is required',
                errors: [{
                    path: 'user_id/usergroup',
                    message: 'At least one identifier is required'
                }]
            });
        }

        // Build where clause for level mappings using OR logic
        const levelMappingWhere: any = {};
        const orConditions: any[] = [];
        
        if (user_id) {
            orConditions.push({ user_id: user_id });
        }
        
        if (hasValidUsergroup) {
            // Handle both single usergroup and array of usergroups
            if (Array.isArray(usergroup)) {
                orConditions.push({ usergroup: { [Op.in]: usergroup } });
            } else {
                orConditions.push({ usergroup: usergroup });
            }
        }

        // Apply OR conditions if multiple criteria exist
        if (orConditions.length > 1) {
            levelMappingWhere[Op.or] = orConditions;
        } else if (orConditions.length === 1) {
            Object.assign(levelMappingWhere, orConditions[0]);
        }
        // Find level mappings for the user/group
        const levelMappings = await LevelMapping.findAll({
            where: levelMappingWhere,
            include: [{
                model: ApprovalLevels,
                as: 'approvalLevel',
                where: { is_delete: false },
                required: true
            }]
        });

        if (!levelMappings || levelMappings.length === 0 && is_published==="false"||is_published==="False") {
            return handleSuccessResponse(res, {
                message: 'No approval levels found for this user/group',
                data: {
                    experiences: [],
                    user_levels: [],
                    pagination: {
                        total: 0,
                        totalPages: 0,
                        currentPage: 1,
                        limit: Number(limit),
                        offset: Number(offset)
                    }
                }
            });
        }

        // Extract levels from the mappings
        const userLevels = levelMappings.map(mapping => 
            (mapping.approvalLevel as any)?.level
        ).filter(level => level !== undefined && level !== null);
        
        if (userLevels.length === 0 && is_published==="false"||is_published==="False") {
            return handleSuccessResponse(res, {
                message: 'No valid approval levels found',
                data: {
                    experiences: [],
                    user_levels: [],
                    pagination: {
                        total: 0,
                        totalPages: 0,
                        currentPage: 1,
                        limit: Number(limit),
                        offset: Number(offset)
                    }
                }
            });
        }
        if (is_published==="true"||is_published==="True") {
            // Get company_id from filter or from levelMappings
            const companyId = filter?.company_id || (levelMappings[0]?.approvalLevel as any)?.company_id;
            
            if (companyId) {
                // Get the maximum approval level for the company
                const maxLevel = await ApprovalLevels.max('level', {
                    where: {
                        company_id: companyId,
                        is_delete: false
                    }
                }) as number | null;

                if (maxLevel !== null && maxLevel !== undefined) {
                    // Add max_level + 1 to userLevels array
                    const publishedLevel = maxLevel + 1;
                    if (!userLevels.includes(publishedLevel)) {
                        userLevels.push(publishedLevel);
                    }
                }
            }
        }
        // Build where clause for experiences
        const experienceWhere: any = {
            is_delete: false,
            current_approval_level: userLevels, // Filter by user's approval levels
            status: { [Op.ne]: 'published' } // Exclude published experiences
        };

        // Add additional filters from request
        if (filter) {
            if (filter.categoryId) {
                experienceWhere.categoryId = filter.categoryId;
            }
            if (filter.company_id) {
                experienceWhere.company_id = filter.company_id;
            }
            if (filter.site_id) {
                experienceWhere.site_id = filter.site_id;
            }
            if (filter.seasonId){
                experienceWhere.seasonId = filter.seasonId
            }
        }

        // Fetch experiences matching the criteria with pagination
        const { count, rows: experiences } = await Experience.findAndCountAll({
            where: experienceWhere,
            limit: Number(limit),
            offset: Number(offset),
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: ExperienceImage,
                    as: 'images',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperiencePDF,
                    as: 'pdfs',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                },
                {
                    model: ExperienceVideo,
                    as: 'videos',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Check if no experiences found
        if (!experiences || experiences.length === 0) {
            return handleSuccessResponse(res, {
                message: 'No experiences found for approval',
                data: {
                    experiences: [],
                    user_levels: userLevels,
                    pagination: {
                        total: 0,
                        totalPages: 0,
                        currentPage: Math.floor(offset / limit) + 1,
                        limit: Number(limit),
                        offset: Number(offset)
                    }
                }
            });
        }

        // Get the maximum approval level from the company_id in filter
        let maxApprovalLevel: number | null = null;
        
        if (filter?.company_id) {
            const maxLevelRecord = await ApprovalLevels.findOne({
                where: {
                    company_id: filter.company_id,
                    is_delete: false
                },
                order: [['level', 'DESC']],
                attributes: ['level']
            });
            
            if (maxLevelRecord && maxLevelRecord.level !== null) {
                maxApprovalLevel = maxLevelRecord.level;
            }
        }

        // Format experiences using common response structure
        const formattedExperiences = experiences.map(experience => {
            const imageUrls = experience.images?.map(img => img.path) || [];
            // Get PDF data from the related PDFs
            const pdfsData = (experience as any).pdfs?.map((pdf: ExperiencePDF) => ({
                id: pdf.id,
                path: pdf.path,
                name: pdf.name,
                uploaded_file_name: pdf.uploaded_file_name
            })) || [];
            const pdfUrls = pdfsData.map((pdf: any) => pdf.path);
            const uploadedPdfNames = pdfsData.map((pdf: any) => pdf.uploaded_file_name).filter((name: string | null) => name !== null);
            
            // Get video URL from the related videos (use first video if exists, otherwise null)
            const videos = (experience as any).videos || [];
            const videoUrl = videos.length > 0 ? videos[0].path : null;
            
            const experienceJson = experience.toJSON();

            // Determine if this experience is at final approval level
            const isFinalLevel = maxApprovalLevel !== null 
                ? experience.current_approval_level > maxApprovalLevel 
                : false;

            return {
                ...experienceJson,
                videosUrl: videoUrl,
                imagesUrl: imageUrls,
                pdfsUrl: pdfUrls,
                pdfs_name: pdfsData, // Include full PDF data with uploaded file names
                uploaded_pdf_name: uploadedPdfNames, // Array of uploaded PDF file names
                price: normalizePrice(experienceJson.price),
                category_name: (experience as any).category?.name || null,
                season_name: (experience as any).season?.name || null,
                is_final_level: isFinalLevel,
                // Remove nested relations from the response
                images: undefined,
                pdfs: undefined,
                videos: undefined,
                category: undefined,
                season: undefined
            };
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        return handleSuccessResponse(res, {
            message: 'Experiences retrieved successfully',
            data: {
                experiences: formattedExperiences,
                user_levels: userLevels,
                pagination: {
                    total: count,
                    totalPages,
                    currentPage,
                    limit: Number(limit),
                    offset: Number(offset)
                }
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route GET /api/experience/approval_level/:company_id
 * @desc Get count of approval levels for a company
 */
router.get('/approval_level/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        // Validate required parameter
        if (!company_id) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Company ID is required',
                errors: [{
                    path: 'company_id',
                    message: 'company_id parameter is required'
                }]
            });
        }

        // Get count of approval levels for this company
        const count = await ApprovalLevels.count({
            where: {
                company_id: company_id,
                is_delete: false
            }
        });

        // Also get the max level number
        const maxLevel = await ApprovalLevels.max('level', {
            where: {
                company_id: company_id,
                is_delete: false
            }
        }) as number | null;
        return handleSuccessResponse(res, {
            message: 'Approval levels count retrieved successfully',
            data: {
                company_id: company_id,
                total_levels: count,
                max_level: maxLevel || 0,
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

/**
 * @route DELETE /api/experience/:experience_id/images/:image_name
 * @desc Delete an image, PDF, or video from an experience
 * @query type - Type of file to delete: 'pdf', 'image', or 'video'
 */
router.delete('/:experience_id/files/:file_name', async (req, res) => {
    try {
        const experienceId = parseInt(req.params.experience_id);
        const imageName = req.params.file_name;
        const type = req.query.type as string;

        // Validate experience_id
        if (isNaN(experienceId)) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Invalid experience ID',
                errors: [{
                    path: 'experience_id',
                    message: 'Experience ID must be a valid number'
                }]
            });
        }

        // Validate image_name
        if (!imageName) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Image name is required',
                errors: [{
                    path: 'image_name',
                    message: 'Image name parameter is required'
                }]
            });
        }

        // Validate type parameter
        if (!type || (type !== 'pdf' && type !== 'image' && type !== 'video')) {
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Invalid or missing type parameter',
                errors: [{
                    path: 'type',
                    message: 'Type must be either "pdf", "image", or "video"'
                }]
            });
        }

        let record: ExperienceImage | ExperiencePDF | ExperienceVideo | null = null;
        let filePath: string = '';
        let folderType: string = '';

        // Find the record based on type
        if (type === 'pdf') {
            record = await ExperiencePDF.findOne({
                where: {
                    experience_id: experienceId,
                    name: imageName
                }
            });
            folderType = 'pdfs';
        } else if (type === 'image') {
            record = await ExperienceImage.findOne({
                where: {
                    experience_id: experienceId,
                    name: imageName
                }
            });
            folderType = 'images';
        } else if (type === 'video') {
            record = await ExperienceVideo.findOne({
                where: {
                    experience_id: experienceId,
                    name: imageName
                }
            });
            folderType = 'videos';
        }

        // Check if record exists
        if (!record) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: `${type} not found`,
                errors: [{
                    path: 'image_name',
                    message: `No ${type} found with name "${imageName}" for experience ${experienceId}`
                }]
            });
        }

        // Construct file path
        // For videos, extract the actual filename from the path since name stores original filename
        if (type === 'video') {
            const pathParts = (record as ExperienceVideo).path.split('/');
            const actualFileName = pathParts[pathParts.length - 1];
            filePath = path.join(__dirname, '..', '..', folderType, experienceId.toString(), actualFileName);
        } else {
            // For images and PDFs, name field matches the stored filename
            filePath = path.join(__dirname, '..', '..', folderType, experienceId.toString(), imageName);
        }

        // Delete the file from filesystem
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileError) {
            // Log error but continue with database deletion
            console.error(`Error deleting file ${filePath}:`, fileError);
        }

        // Delete the record from database
        await record.destroy();

        // Update experience's imagesUrl or videosUrl if needed
        const experience = await Experience.findByPk(experienceId);
        if (experience) {
            if (type === 'image') {
                // Get remaining images
                const remainingImages = await ExperienceImage.findAll({
                    where: { experience_id: experienceId }
                });
                const imageUrls = remainingImages.map(img => img.path);
                await experience.update({ imagesUrl: imageUrls });
            } else if (type === 'video') {
                // Check if there are any remaining videos
                const remainingVideos = await ExperienceVideo.findAll({
                    where: { experience_id: experienceId }
                });
                if (remainingVideos.length === 0) {
                    await experience.update({ videosUrl: undefined });
                } else {
                    // Update to the first remaining video path
                    await experience.update({ videosUrl: remainingVideos[0].path });
                }
            }
        }

        return handleSuccessResponse(res, {
            message: `${type} deleted successfully`,
            data: {
                experience_id: experienceId,
                file_name: imageName,
                type: type
            }
        });

    } catch (error) {
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Internal server error',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
});

export default router;