import fs from 'fs';
import path from 'path';
import { ExperienceImage } from '../models/ExperienceImage';

interface ImageFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path: string;
    size: number;
}

// Helper function to ensure directory exists
const ensureDirectory = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Helper function to delete a file if it exists
const deleteFileIfExists = (filePath: string): void => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        // Don't throw, just continue
    }
};

// Helper function to save image file and create database record
const saveImageAndCreateRecord = async (
    image: ImageFile,
    experienceId: number,
    experienceDirPath: string
): Promise<ExperienceImage | null> => {
    try {
        // Create unique filename with timestamp
        const timestamp = new Date().getTime();
        const fileExtension = path.extname(image.originalname);
        const newFileName = `${experienceId}_${timestamp}${fileExtension}`;
        const filePath = path.join(experienceDirPath, newFileName);
        
        // Verify source file exists and is valid
        if (!fs.existsSync(image.path) || image.size === 0) {
            return null;
        }

        // Copy file to destination
        fs.copyFileSync(image.path, filePath);

        // Create database record
        const imagePath = `/images/${experienceId}/${newFileName}`;
        const imageRecord = await ExperienceImage.create({
            experience_id: experienceId,
            name: newFileName,
            path: imagePath,
            uploaded_file_name: image.originalname
        });

        return imageRecord;
    } catch (error) {
        return null;
    }
};

export const handleImagesUpload = async (images: ImageFile[] | null, experienceId: number): Promise<ExperienceImage[]> => {
    const imageRecords: ExperienceImage[] = [];
    const experienceDirPath = path.join(__dirname, '..', '..', 'images', experienceId.toString());

    try {
        // Get existing images
        const existingImages = await ExperienceImage.findAll({
            where: { experience_id: experienceId }
        });

        // Handle case when no new images are provided
        if (!images || images.length === 0) {
            // Delete all existing files and records
            for (const image of existingImages) {
                // Resolve path relative to project root (image.path is like /images/13/file.jpg)
                const filePath = path.join(__dirname, '..', '..', image.path);
                deleteFileIfExists(filePath);
                await image.destroy();
            }

            // Remove empty directory if it exists
            if (fs.existsSync(experienceDirPath)) {
                try {
                    // Try to remove directory (only works if empty)
                    fs.rmdirSync(experienceDirPath);
                } catch (error) {
                    // Directory might not be empty or already deleted
                }
            }
            
            return imageRecords;
        }

        // Always delete all existing images and files first when new images are provided
        // Delete all files from database records
        for (const existingImage of existingImages) {
            // Resolve path relative to project root (image.path is like /images/13/file.jpg)
            const filePath = path.join(__dirname, '..', '..', existingImage.path);
            deleteFileIfExists(filePath);
            await existingImage.destroy();
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);

        // Process and save all new images
        for (const image of images) {
            const newImageRecord = await saveImageAndCreateRecord(image, experienceId, experienceDirPath);
            if (newImageRecord) {
                imageRecords.push(newImageRecord);
            }
        }

        // Delete orphaned files: files in directory but NOT in database (after saving new images)
        // Fetch all valid images from database to ensure we have the complete list
        const validImagesInDb = await ExperienceImage.findAll({
            where: { experience_id: experienceId }
        });

        if (fs.existsSync(experienceDirPath)) {
            try {
                // Get all files in the directory
                const filesInDirectory = fs.readdirSync(experienceDirPath);
                
                // Get all valid file names from database
                const validFileNames = new Set(
                    validImagesInDb.map(img => {
                        // Extract filename from path (e.g., /images/13/file.jpg -> file.jpg)
                        return path.basename(img.path);
                    })
                );
                
                // Delete files that are not in the database
                for (const file of filesInDirectory) {
                    const filePath = path.join(experienceDirPath, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.isFile() && !validFileNames.has(file)) {
                        deleteFileIfExists(filePath);
                    }
                }
            } catch (error) {
            }
        }

        return imageRecords;
    } catch (error) {
        return imageRecords;
    }
};