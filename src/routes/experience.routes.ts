import express, { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Experience } from '../models/Experience';
import { Category } from '../models/Category';
import { Season } from '../models/Season';
import { ExperienceImage } from '../models/ExperienceImage';
import { handleErrorResponse, handleSuccessResponse } from '../utils/response.handler';
import { handleVideoUpload } from '../utils/video.handler';
import { handleImagesUpload } from '../utils/image.handler';

const router: Router = express.Router();

// Debug: Log when router is created
console.log('\n=== Experience Router Initialization ===');
console.log('Creating experience router');

// Debug middleware for all experience routes
router.use((req, res, next) => {
    console.log('\n=== Experience Route Debug ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Full URL:', req.originalUrl);
    console.log('Params:', req.params);
    next();
});


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
        console.log('\n=== Form Data Details ===');
        console.log('Content-Type:', req.headers['content-type']);
        // No file handling in this route
        
        // Get form data
        const formData: Record<string, any> = req.body;
        
        // Print form fields in a structured way
        console.log('\nReceived Form Fields:');
        console.log('---------------------');
        console.log('Required Fields:');
        console.log('- company_id:', formData.company_id);
        console.log('- site_id:', formData.site_id);
        console.log('- created_user:', formData.created_user);
        console.log('- updated_user:', formData.updated_user);
        console.log('- is_delete:', formData.is_delete);
        
        console.log('\nGuide Fields:');
        console.log('- isGuided:', formData.isGuided);
        console.log('- guideType:', formData.guideType);
        console.log('- noOfGuides:', formData.noOfGuides);
        
        console.log('\nMedia Fields:');
        console.log('- video:', formData.video || 'Not provided');
        console.log('- imagesUrl:', formData.images || 'Not provided');
        
        console.log('\nAdditional Fields:');
        console.log('- additionalInformation:', formData.additionalInformation);
        console.log('- termsAndConditions:', formData.termsAndConditions);
        console.log('- costBreakdown:', formData.costBreakdown);
        console.log('- billingInstructions:', formData.billingInstructions);
        
        console.log('\n=====================');
        
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
        
        // Log raw request body
        console.log('Raw request body:', req.body);
        console.log('Content-Type:', req.headers['content-type']);

        // Log individual field values for debugging
        console.log('=== Form Field Values ===');
        console.log('site_id:', formData.site_id);
        console.log('name:', formData.name);
        console.log('additionalInformation:', formData.additionalInformation);
        console.log('termsAndConditions:', formData.termsAndConditions);
        console.log('costBreakdown:', formData.costBreakdown);
        console.log('billingInstructions:', formData.billingInstructions);
        console.log('company_id:', formData.company_id);
        console.log('created_user:', formData.created_user);
        console.log('=====================');

        // Create the experience object from form-data
        const experienceData = {
            // Required fields with proper type conversion
            site_id: formData.site_id || undefined,
            company_id: formData.company_id || undefined,
            created_user: formData.created_user ? parseInt(formData.created_user) : undefined,
            updated_user: formData.updated_user ? parseInt(formData.updated_user) : undefined,
            is_delete: formData.is_delete === 'true',
            name: formData.name || 'Untitled Experience',
            status: 'pending',

            // Boolean fields
            isExcursion: formData.isExcursion === 'true',
            isGuided: formData.isGuided === 'true',
            isPickupServiceAvailable: formData.isPickupServiceAvailable === 'true',

            // Number fields
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
            seasonId: formData.seasonId ? parseInt(formData.seasonId) : undefined,
            minimumParticipant: formData.minimumParticipant ? parseInt(formData.minimumParticipant) : undefined,
            maximumParticipant: formData.maximumParticipant ? parseInt(formData.maximumParticipant) : undefined,

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

        };
        

        console.log('Experience data:', experienceData);

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
        
        // Initialize empty arrays for media URLs
        experience.imagesUrl = [];
        experience.videosUrl = null as any;

        // Debug file uploads
        console.log('\n=== File Upload Debug ===');
        console.log('req.files:', JSON.stringify(req.files, null, 2));
        console.log('req.files type:', typeof req.files);
        if (req.files) {
            console.log('Available file fields:', Object.keys(req.files));
            if ((req.files as any).images) {
                console.log('Number of images:', (req.files as any).images.length);
                console.log('Image details:', JSON.stringify((req.files as any).images, null, 2));
            } else {
                console.log('No images field found in request');
            }
        }
        console.log('======================\n');

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
                    console.error('Error handling video upload:', uploadError);
                    // Continue with the response even if video upload fails
                }
            }

            // Handle images upload
            console.log('\n=== Image Upload Debug ===');
            console.log('Checking for images in files:', files);
            if (files.images) {
                console.log('Found images array:', files.images);
                console.log('Number of images:', files.images.length);
            } else {
                console.log('No images found in request');
            }
            console.log('======================\n');

            if (files.images && files.images.length > 0) {
                try {
                    console.log('Attempting to upload', files.images.length, 'images');
                    const imageRecords = await handleImagesUpload(files.images, experience.id);
                    console.log('Successfully uploaded images:', imageRecords);
                    
                    // Get image paths and update experience
                    const imagePaths = imageRecords.map(record => record.path);
                    await experience.update({ imagesUrl: imagePaths });
                    experience.imagesUrl = imagePaths; // Update the instance for response
                    console.log('Updated experience with image paths');
                } catch (uploadError) {
                    console.error('Error handling images upload:', uploadError);
                    console.error('Error details:', JSON.stringify(uploadError, null, 2));
                    // Continue with the response even if image upload fails
                }
            }
        }

        return handleSuccessResponse(res, {
            message: 'Experience created successfully',
            data: experience
        });

    } catch (error: unknown) {
        console.error('Error creating experience:', error);
        
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

        // Prepare response data
        const responseData = {
            ...experience.toJSON(),
            videosUrl: experience.videosUrl || null,
            imagesUrl: imageUrls,
            category_name: (experience as any).category?.name || null,
            season_name: (experience as any).season?.name || null,
            // Remove nested relations from the response
            images: undefined,
            category: undefined,
            season: undefined
        };

        return handleSuccessResponse(res, {
            message: 'Experience retrieved successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching experience:', error);
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
        console.log(`Soft deleted experience with ID: ${experienceId}`);

        return handleSuccessResponse(res, {
            message: 'Experience deleted successfully',
            data: {
                id: experienceId,
                is_delete: true
            }
        });

    } catch (error) {
        console.error('Error deleting experience:', error);
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
    console.log('\n=== PUT Experience Handler ===');
    console.log('Handler triggered for PUT /:id');
    console.log('ID parameter:', req.params.id);
    console.log('Full URL:', req.originalUrl);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('PUT route handler called');
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    try {
        console.log('\n=== Experience Edit Debug ===');
        console.log('Request Method:', req.method);
        console.log('Request Path:', req.path);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        const experienceId = parseInt(req.params.id);
        console.log('Experience ID:', experienceId);
        
        // Find the experience
        const experience = await Experience.findByPk(experienceId);
        console.log('Found Experience:', experience?.toJSON());
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
        
        // Log the form data we're about to use for update
        console.log('\nUpdate Data:', formData);
        
        // Create the experience object from form-data
        const experienceData = {
            // Required fields with proper type conversion
            site_id: formData.site_id || experience.site_id,
            company_id: formData.company_id || experience.company_id,
            updated_user: formData.updated_user ? parseInt(formData.updated_user) : experience.updated_user,
            is_delete: formData.is_delete === 'true' || experience.is_delete,
            name: formData.name || experience.name,
            status: formData.status || experience.status,

            // Boolean fields
            isExcursion: formData.isExcursion === 'true' || experience.isExcursion,
            isGuided: formData.isGuided === 'true' || experience.isGuided,
            isPickupServiceAvailable: formData.isPickupServiceAvailable === 'true' || experience.isPickupServiceAvailable,

            // Number fields
            categoryId: formData.categoryId ? parseInt(formData.categoryId) : experience.categoryId,
            seasonId: formData.seasonId ? parseInt(formData.seasonId) : experience.seasonId,
            minimumParticipant: formData.minimumParticipant ? parseInt(formData.minimumParticipant) : experience.minimumParticipant,
            maximumParticipant: formData.maximumParticipant ? parseInt(formData.maximumParticipant) : experience.maximumParticipant,

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
            location: formData.location || experience.location,
            difficultyLevel: formData.difficultyLevel || experience.difficultyLevel,
            duration: formData.duration || experience.duration,
            guideType: formData.guideType || experience.guideType,
            noOfGuides: formData.noOfGuides || experience.noOfGuides,
            travellMedium: formData.travellMedium || experience.travellMedium,
            prefferedTime: formData.prefferedTime || experience.prefferedTime,
            whatWillYouDo: formData.whatWillYouDo || experience.whatWillYouDo,
            whatYouWillExperience: formData.whatYouWillExperience || experience.whatYouWillExperience,
            experienceHighlights: formData.experienceHighlights || experience.experienceHighlights,
            stepByStepItinerary: formData.stepByStepItinerary || experience.stepByStepItinerary,
            whoCanParticipate: formData.whoCanParticipate || experience.whoCanParticipate,
            whatToWear: formData.whatToWear || experience.whatToWear,
            rulesAndRegulation: formData.rulesAndRegulation || experience.rulesAndRegulation,
            carriableItems: formData.carriableItems || experience.carriableItems,
            pickupServiceDetails: formData.pickupServiceDetails || experience.pickupServiceDetails,
            cancellationPolicy: formData.cancellationPolicy || experience.cancellationPolicy,
            safetyProtocols: formData.safetyProtocols || experience.safetyProtocols,
            additionalInformation: formData.additionalInformation || experience.additionalInformation,
            termsAndConditions: formData.termsAndConditions || experience.termsAndConditions,
            costBreakdown: formData.costBreakdown || experience.costBreakdown,
            billingInstructions: formData.billingInstructions || experience.billingInstructions,
        };

        console.log('\nProcessed Update Data:', experienceData);

        // Update basic fields
        await experience.update(experienceData);

        // Handle file uploads if provided
        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            
            // Handle video upload or removal
            console.log('\nChecking for video changes...');
            console.log('Form data video:', formData.video);
            console.log('Files video:', files.video);

            // Check if video field exists and is empty or invalid
            const shouldRemoveVideo = ('video' in formData) && 
                (!files.video || !files.video[0] || files.video[0].size === 0);

            if (shouldRemoveVideo) {
                // Remove existing video
                console.log('Video field is empty or invalid, removing existing video');
                try {
                    await handleVideoUpload(null, experience.id);
                    await experience.update({ videosUrl: '' });
                    experience.videosUrl = ''; // Update the instance for response
                    console.log('Video removed successfully');
                } catch (removeError) {
                    console.error('Error removing video:', removeError);
                    console.error('Error details:', removeError instanceof Error ? removeError.message : removeError);
                }
            } else if (files.video && files.video[0]) {
                // Upload new video
                console.log('Valid video file found:', files.video[0].originalname);
                try {
                    const videoRecord = await handleVideoUpload(files.video[0], experience.id);
                    if (videoRecord) {
                        console.log('Video upload successful:', videoRecord);
                        await experience.update({ videosUrl: videoRecord.path });
                        experience.videosUrl = videoRecord.path; // Update the instance for response
                    }
                } catch (uploadError) {
                    console.error('Error handling video upload:', uploadError);
                    console.error('Error details:', uploadError instanceof Error ? uploadError.message : uploadError);
                }
            } else {
                console.log('No video changes requested');
            }

            // Handle images upload or removal
            console.log('\nChecking for image updates...');
            
            // Get existing images first
            let currentImages = await ExperienceImage.findAll({
                where: { experience_id: experience.id }
            });
            console.log('Current images:', currentImages.map(img => img.toJSON()));

            // Check if we should remove images
            if (formData.removeImages === 'true') {
                console.log('Removing all images as requested');
                try {
                    await handleImagesUpload(null, experience.id);
                    currentImages = [];
                    console.log('All images removed successfully');
                } catch (removeError) {
                    console.error('Error removing images:', removeError);
                }
            }
            // Handle image updates
            else {
                let imagesToProcess = null;
                
                // Check if we have valid images in the request
                if (files.images && files.images.length > 0) {
                    console.log('Found', files.images.length, 'images in request');
                    
                    // Filter out invalid images (like /path/to/file)
                    const validImages = files.images.filter(img => {
                        const isValid = img.originalname !== 'file' && img.size > 0;
                        if (!isValid) {
                            console.log(`Skipping invalid image: ${img.originalname}`);
                        }
                        return isValid;
                    });

                    if (validImages.length > 0) {
                        console.log('Processing', validImages.length, 'valid images');
                        validImages.forEach((img, idx) => {
                            console.log(`Image ${idx + 1}:`, img.originalname);
                        });
                        imagesToProcess = validImages;
                    } else {
                        console.log('No valid images to process, removing existing images');
                        imagesToProcess = null;
                    }
                } else {
                    console.log('No images in request, removing existing images');
                    imagesToProcess = null;
                }

                try {
                    // Process images or remove existing ones if no valid images
                    const imageRecords = await handleImagesUpload(imagesToProcess, experience.id);
                    console.log('Image handling successful:', imageRecords);
                    
                    // Update current images
                    currentImages = imageRecords;
                } catch (uploadError) {
                    console.error('Error handling images:', uploadError);
                }
            }
            
            // Update experience with current image paths
            const imagePaths = currentImages.map(img => img.path);
            console.log('Final image paths:', imagePaths);
            await experience.update({ imagesUrl: imagePaths });
            experience.imagesUrl = imagePaths;
        }

        // Get the latest image records
        const latestImages = await ExperienceImage.findAll({
            where: { experience_id: experienceId }
        });
        const imageUrls = latestImages.map(img => img.path);
        console.log('Latest image URLs:', imageUrls);

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

        // Get the current video URL
        const videoUrl = updatedExperience.videosUrl;
        console.log('Current video URL:', videoUrl);

        // Prepare response data with the latest media URLs and flatten category/season
        const experienceJson = updatedExperience.toJSON();
        const responseData = {
            ...experienceJson,
            videosUrl: videoUrl || null,
            imagesUrl: imageUrls, // Use the directly fetched image URLs
            category_name: (updatedExperience as any).category?.name || null,
            season_name: (updatedExperience as any).season?.name || null,
            // Remove nested relations from the response
            images: undefined,
            category: undefined,
            season: undefined
        };

        console.log('Response data:', responseData);

        return handleSuccessResponse(res, {
            message: 'Experience updated successfully',
            data: responseData
        });

    } catch (error: unknown) {
        console.error('Error updating experience:', error);
        
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
        console.error('Error fetching experiences:', error);
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
/**
 * @route PATCH /api/experience/:id
 * @desc Update specific fields of an experience
 */
router.patch('/:id', async (req, res) => {
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

        // Update only the fields that are provided in the request body
        await experience.update(req.body);

        // Get the updated experience with relations
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
                },
                {
                    model: ExperienceImage,
                    as: 'images',
                    attributes: ['id', 'path', 'name', 'uploaded_file_name']
                }
            ]
        });

        if (!updatedExperience) {
            return handleErrorResponse(res, {
                statusCode: 404,
                message: 'Updated experience not found',
                errors: [{
                    path: 'id',
                    message: 'Experience was updated but could not be retrieved'
                }]
            });
        }

        // Format response
        const imageUrls = updatedExperience?.images?.map(img => img.path) || [];
        const responseData = {
            ...(updatedExperience?.toJSON() || {}),
            videosUrl: updatedExperience.videosUrl || null,
            imagesUrl: imageUrls,
            category_name: (updatedExperience as any).category?.name || null,
            season_name: (updatedExperience as any).season?.name || null,
            // Remove nested relations
            images: undefined,
            category: undefined,
            season: undefined
        };

        return handleSuccessResponse(res, {
            message: 'Experience updated successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Error updating experience:', error);
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

router.post('/filter', async (req, res) => {
    try {
        // Get pagination from query params
        const limit = parseInt(req.query.limit as string) || 10;  // Default limit to 10
        const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0
        
        // Get filters from request body
        const { status, categoryId } = req.body;
        
        // Build where clause
        const whereClause: any = {
            is_delete: false, // Always exclude deleted records
            site_id: "site457"
        };

        // Add status filter if provided
        if (status) {
            whereClause.status = status;
        }

        // Add categoryId filter if provided in query params
        if (categoryId) {
            whereClause.categoryId = categoryId;
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

            // Prepare response data
            const responseData = {
                ...experience.toJSON(),
                videosUrl: experience.videosUrl || null,
                imagesUrl: imageUrls,
                category_name: (experience as any).category?.name || null,
                season_name: (experience as any).season?.name || null,
                // Remove nested relations from the response
                images: undefined,
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
        console.error('Error filtering experiences:', error);
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