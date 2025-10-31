import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Experience } from '../models/Experience';
import { Season } from '../models/Season';
import { sequelize } from '../config/database';
import { handleErrorResponse, handleSuccessResponse } from '../utils/response.handler';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || path.extname(file.originalname) === '.json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Import experiences from JSON file
 * @route POST /api/experience/import
 * @access Private
 */
export const importExperiences = async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    let uploadedFilePath: string | null = null;
    const transaction = await sequelize.transaction();
    
    try {
        // Check if file was uploaded
        if (!req.file) {
            await transaction.rollback();
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'No file uploaded',
                errors: [{
                    path: 'file',
                    message: 'Please upload a JSON file'
                }]
            });
        }

        uploadedFilePath = req.file.path;

        // Read and parse the JSON file
        const fileContent = fs.readFileSync(uploadedFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        const { activities } = jsonData;

        if (!activities || !Array.isArray(activities)) {
            await transaction.rollback();
            return handleErrorResponse(res, {
                statusCode: 400,
                message: 'Invalid JSON format. Expected an object with an "activities" array',
                errors: [{
                    path: 'activities',
                    message: 'Activities must be an array'
                }]
            });
        }

        const importedExperiences = [];
        const errors = [];

        for (const activity of activities) {
            try {
                // Step 1: Handle season - find or create
                let seasonId: number | undefined = undefined;
                if (activity.season) {
                    // Try to find existing season by name, company_id, and site_id
                    let season = await Season.findOne({
                        where: {
                            name: activity.season,
                            company_id: activity.company_id,
                            site_id: activity.site_id,
                            is_delete: false
                        },
                        transaction
                    });

                    // If season doesn't exist, create it
                    if (!season) {
                        season = await Season.create({
                            name: activity.season,
                            company_id: activity.company_id,
                            site_id: activity.site_id,
                            is_delete: false,
                            created_user: activity.initiated_by_id || undefined,
                            updated_user: undefined,
                            start_month: undefined,
                            end_month: undefined
                        }, { transaction });
                    }
                    seasonId = season.id;
                }

                // Step 2: Map activity data to experience data
                const status = activity.activity_status ? activity.activity_status.toLowerCase() : 'draft';
                const isDelete = activity.activity_status === 'DELETED' ? true : activity.activity_status === 'ACTIVE' ? false : false;
                
                const experienceData = {
                    name: activity.name || 'Untitled Experience',
                    // Convert to lowercase
                    status: status,
                    categoryId: undefined,
                    seasonId: seasonId,
                    
                    // Map other fields
                    company_id: activity.company_id,
                    site_id: activity.site_id,
                    department_id: activity.department_id,
                    created_user: activity.initiated_by_id || undefined,
                    updated_user: undefined,
                    is_delete: isDelete,
                    
                    // Boolean fields
                    isExcursion: activity.excursion === 1 || activity.excursion === true,
                    isGuided: activity.guided === 1 || activity.guided === true,
                    
                    // Basic info - convert to lowercase
                    difficultyLevel: activity.difficulty_level ? activity.difficulty_level.toLowerCase() : undefined,
                    duration: activity.duration,
                    guideType: activity.guide_type ? activity.guide_type.toLowerCase() : undefined,
                    noOfGuides: activity.no_of_guides?.toString(),
                    minimumParticipant: activity.pax_limit ? 1 : undefined,
                    maximumParticipant: activity.pax_limit || undefined,
                    travellMedium: activity.travel_medium,
                    prefferedTime: activity.time,
                    
                    // Detailed descriptions
                    whatWillYouDo: activity.description_of_activity,
                    whatYouWillExperience: activity.activity_experience,
                    experienceHighlights: activity.activity_features,
                    stepByStepItinerary: activity.experience_detailing,
                    whoCanParticipate: activity.participating_info,
                    whatToWear: activity.wearables,
                    rulesAndRegulation: activity.rules,
                    carriableItems: activity.carriables_items,
                    whatsIncluded: activity.package_inclusion ? activity.package_inclusion.split('\n') : [],
                    whatsExcluded: activity.package_exclusion ? activity.package_exclusion.split('\n') : [],
                    additionalInformation: activity.additional_info,
                    safetyProtocols: activity.safety_protocol,
                    costBreakdown: activity.cost_detailing,
                    billingInstructions: activity.billing_instruction,
                    
                    // Default values
                    current_approval_level: 0,
                    reason_for_reject: undefined,
                    createdAt: activity.created_on,
                    updatedAt: activity.updated_on
                };

                // Create the experience
                const experience = await Experience.create(experienceData, { transaction });
                importedExperiences.push({
                    id: experience.id,
                    name: experience.name,
                    status: experience.status,
                    seasonId: experience.seasonId
                });

            } catch (error) {
                console.error(`Error importing activity ${activity.name || 'unknown'}:`, error);
                errors.push({
                    activity: activity.name || 'unknown',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        // Check if there were errors during import
        if (errors.length > 0) {
            // Rollback transaction if there were any errors
            await transaction.rollback();
        } else {
            // Commit transaction if all imports succeeded
            await transaction.commit();
        }

        // Clean up uploaded file
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            fs.unlinkSync(uploadedFilePath);
        }

        return handleSuccessResponse(res, {
            message: `Successfully imported ${importedExperiences.length} out of ${activities.length} experiences`,
            data: {
                imported: importedExperiences,
                errors: errors.length > 0 ? errors : null,
                summary: {
                    total: activities.length,
                    successful: importedExperiences.length,
                    failed: errors.length
                }
            }
        });

    } catch (error) {
        console.error('Error importing experiences:', error);
        
        // Rollback transaction in case of error
        try {
            await transaction.rollback();
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }
        
        // Clean up uploaded file in case of error
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            fs.unlinkSync(uploadedFilePath);
        }
        
        return handleErrorResponse(res, {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to import experiences',
            errors: [{
                path: 'server',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            }]
        });
    }
};

