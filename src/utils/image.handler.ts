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
            console.log(`Successfully deleted file: ${filePath}`);
        } else {
            console.log(`File does not exist, skipping: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        // Don't throw, just log the error and continue
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
            console.log(`Invalid source file: ${image.path}`);
            return null;
        }

        // Copy file to destination
        fs.copyFileSync(image.path, filePath);
        console.log(`Saved image to: ${filePath}`);

        // Create database record
        const imagePath = `/images/${experienceId}/${newFileName}`;
        const imageRecord = await ExperienceImage.create({
            experience_id: experienceId,
            name: newFileName,
            path: imagePath,
            uploaded_file_name: image.originalname
        });

        console.log(`Created database record for: ${image.originalname}`);
        return imageRecord;
    } catch (error) {
        console.error(`Failed to save image ${image.originalname}:`, error);
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
        console.log('Found existing images:', existingImages.length);

        // Handle case when no new images are provided
        if (!images || images.length === 0) {
            console.log('No new images provided, removing all existing images');
            
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
                    console.log(`Removed empty directory: ${experienceDirPath}`);
                } catch (error) {
                    // Directory might not be empty or already deleted
                    console.log(`Could not remove directory (may not be empty): ${experienceDirPath}`);
                }
            }
            
            return imageRecords;
        }

        // Always delete all existing images and files first when new images are provided
        console.log('Removing all existing images for experience:', experienceId);
        
        // Delete all files from database records
        for (const existingImage of existingImages) {
            // Resolve path relative to project root (image.path is like /images/13/file.jpg)
            const filePath = path.join(__dirname, '..', '..', existingImage.path);
            console.log(`Attempting to delete file: ${filePath}`);
            deleteFileIfExists(filePath);
            await existingImage.destroy();
            console.log(`Deleted database record for: ${existingImage.path}`);
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);
        console.log('Directory ensured:', experienceDirPath);

        // Process and save all new images
        console.log(`Processing ${images.length} new images`);
        for (const image of images) {
            const newImageRecord = await saveImageAndCreateRecord(image, experienceId, experienceDirPath);
            if (newImageRecord) {
                imageRecords.push(newImageRecord);
                console.log(`Successfully saved image: ${image.originalname}`);
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
                
                console.log(`Checking for orphaned files: ${filesInDirectory.length} files in directory, ${validFileNames.size} valid in database`);
                
                // Delete files that are not in the database
                for (const file of filesInDirectory) {
                    const filePath = path.join(experienceDirPath, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.isFile() && !validFileNames.has(file)) {
                        deleteFileIfExists(filePath);
                        console.log(`Deleted orphaned file (not in database): ${file}`);
                    }
                }
            } catch (error) {
                console.error(`Error cleaning orphaned files in ${experienceDirPath}:`, error);
            }
        }

        console.log(`Successfully processed ${imageRecords.length} images for experience ${experienceId}`);
        return imageRecords;
    } catch (error) {
        console.error('Error in handleImagesUpload:', error);
        return imageRecords;
    }
};