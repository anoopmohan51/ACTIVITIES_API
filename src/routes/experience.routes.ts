import express, { Router } from 'express';
import { Experience } from '../models/Experience';
import { Category } from '../models/Category';
import { Season } from '../models/Season';
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
                    await experience.update({ videosUrl: videoRecord.path });
                    experience.videosUrl = videoRecord.path; // Update the instance for response
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
 * @route GET /api/experience/site/:siteId
 * @desc List experiences by site_id
 */
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
            
            // Handle video upload
            console.log('\nChecking for video upload...');
            if (files.video && files.video[0]) {
                console.log('Video file found:', files.video[0].originalname);
                try {
                    const videoRecord = await handleVideoUpload(files.video[0], experience.id);
                    console.log('Video upload successful:', videoRecord);
                    await experience.update({ videosUrl: videoRecord.path });
                    experience.videosUrl = videoRecord.path; // Update the instance for response
                } catch (uploadError) {
                    console.error('Error handling video upload:', uploadError);
                    console.error('Error details:', uploadError instanceof Error ? uploadError.message : uploadError);
                }
            } else {
                console.log('No video file in request');
            }

            // Handle images upload or removal
            console.log('\nChecking for image updates...');
            
            // Check if we should remove images
            // This happens when either removeImages=true OR when no images are provided in the update
            if (formData.removeImages === 'true' || (!files.images && formData.hasOwnProperty('images'))) {
                console.log('Removing all images as requested');
                try {
                    await handleImagesUpload(null, experience.id);
                    await experience.update({ imagesUrl: [] });
                    experience.imagesUrl = []; // Update the instance for response
                    console.log('All images removed successfully');
                } catch (removeError) {
                    console.error('Error removing images:', removeError);
                    console.error('Error details:', removeError instanceof Error ? removeError.message : removeError);
                }
            }
            // Handle new image uploads if present
            else if (files.images && files.images.length > 0) {
                console.log('Found', files.images.length, 'images:');
                files.images.forEach((img, idx) => {
                    console.log(`Image ${idx + 1}:`, img.originalname);
                });
                try {
                    const imageRecords = await handleImagesUpload(files.images, experience.id);
                    console.log('Image upload successful:', imageRecords);
                    const imagePaths = imageRecords.map(record => record.path);
                    await experience.update({ imagesUrl: imagePaths });
                    experience.imagesUrl = imagePaths; // Update the instance for response
                    console.log('Updated experience with image paths:', imagePaths);
                } catch (uploadError) {
                    console.error('Error handling images upload:', uploadError);
                    console.error('Error details:', uploadError instanceof Error ? uploadError.message : uploadError);
                }
            } else {
                console.log('No image changes requested');
            }
        }

        // Fetch the updated experience with all fields
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

        // Get the current video and image URLs
        const currentExperience = await Experience.findByPk(experienceId);
        const videoUrl = currentExperience?.videosUrl;
        const imageUrls = currentExperience?.imagesUrl;

        console.log('Current video URL:', videoUrl);
        console.log('Current image URLs:', imageUrls);

        // Prepare response data
        const responseData = {
            ...updatedExperience?.toJSON(),
            videosUrl: videoUrl || null,
            imagesUrl: imageUrls || []
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

// ... rest of the file remains unchanged ...

export default router;