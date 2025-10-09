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
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
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
    const experienceDirPath = path.join('/app/images', experienceId.toString());

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
                deleteFileIfExists(path.join('/app', image.path));
                await image.destroy();
            }

            // Remove empty directory if it exists
            if (fs.existsSync(experienceDirPath)) {
                fs.rmdirSync(experienceDirPath);
            }
            
            return imageRecords;
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);

        // Get list of files to keep
        const newImageNames = new Set(images.map(img => img.originalname));
        console.log('New images to process:', Array.from(newImageNames));

        // Remove images that are not in the new upload
        for (const existingImage of existingImages) {
            if (!newImageNames.has(existingImage.uploaded_file_name)) {
                console.log(`Removing old image: ${existingImage.uploaded_file_name}`);
                deleteFileIfExists(path.join('/app', existingImage.path));
                await existingImage.destroy();
            } else {
                console.log(`Keeping existing image: ${existingImage.uploaded_file_name}`);
                imageRecords.push(existingImage);
            }
        }

        // Process new images
        for (const image of images) {
            // Skip if image already exists
            const existingImage = existingImages.find(img => img.uploaded_file_name === image.originalname);
            if (existingImage) {
                continue; // Already added to imageRecords above
            }

            // Save new image
            const newImageRecord = await saveImageAndCreateRecord(image, experienceId, experienceDirPath);
            if (newImageRecord) {
                imageRecords.push(newImageRecord);
            }
        }

        console.log(`Successfully processed ${imageRecords.length} images`);
        return imageRecords;
    } catch (error) {
        console.error('Error in handleImagesUpload:', error);
        return imageRecords;
    }
};