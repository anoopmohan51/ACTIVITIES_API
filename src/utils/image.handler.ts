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
        // Only process if images are provided
        if (!images || images.length === 0) {
            return imageRecords;
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);

        // Process and save all new images (append mode - don't delete existing)
        for (const image of images) {
            const newImageRecord = await saveImageAndCreateRecord(image, experienceId, experienceDirPath);
            if (newImageRecord) {
                imageRecords.push(newImageRecord);
            }
        }

        return imageRecords;
    } catch (error) {
        return imageRecords;
    }
};