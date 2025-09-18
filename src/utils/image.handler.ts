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

export const handleImagesUpload = async (images: ImageFile[] | null, experienceId: number): Promise<ExperienceImage[]> => {
    const imageRecords: ExperienceImage[] = [];

    try {
        // Setup directory path - directly in ID folder
        const experienceDirPath = path.join(__dirname, '..', '..', 'images', experienceId.toString());

        // Find existing images for this experience
        const existingImages = await ExperienceImage.findAll({
            where: { experience_id: experienceId }
        });

        // If images is null, remove all images
        if (images === null) {
            // Delete all files in the experience directory
            if (fs.existsSync(experienceDirPath)) {
                const files = fs.readdirSync(experienceDirPath);
                for (const file of files) {
                    const filePath = path.join(experienceDirPath, file);
                    fs.unlinkSync(filePath);
                }
                // Remove the empty directory
                fs.rmdirSync(experienceDirPath);
            }

            // Delete all database records
            for (const image of existingImages) {
                await image.destroy();
            }
            
            return imageRecords;
        }

        // Create experience directory if it doesn't exist
        if (!fs.existsSync(experienceDirPath)) {
            fs.mkdirSync(experienceDirPath, { recursive: true });
        }

        // Delete all existing files in the directory
        const existingFiles = fs.readdirSync(experienceDirPath);
        for (const file of existingFiles) {
            const filePath = path.join(experienceDirPath, file);
            fs.unlinkSync(filePath);
        }

        // Delete all existing database records
        for (const image of existingImages) {
            await image.destroy();
        }

        // Process and save new images
        for (const image of images) {
            try {
                const timestamp = new Date().getTime();
                const fileExtension = path.extname(image.originalname);
                const newFileName = `${experienceId}_${timestamp}${fileExtension}`;
                const filePath = path.join(experienceDirPath, newFileName);

                // Move file to final location
                await new Promise<void>((resolve, reject) => {
                    const readStream = fs.createReadStream(image.path);
                    const writeStream = fs.createWriteStream(filePath);
                    
                    readStream.on('error', reject);
                    writeStream.on('error', reject);
                    writeStream.on('finish', resolve);
                    
                    readStream.pipe(writeStream);
                });

                // Delete the source file
                fs.unlinkSync(image.path);

                // Create database record with path directly in ID folder
                const imageRecord = await ExperienceImage.create({
                    experience_id: experienceId,
                    name: image.originalname,
                    path: `/images/${experienceId}/${newFileName}`,
                    uploaded_file_name: image.originalname
                });

                imageRecords.push(imageRecord);
            } catch (error) {
                console.error(`Failed to process image ${image.originalname}:`, error);
                // Continue with next image
            }
        }

        return imageRecords;
    } catch (error) {
        console.error('Error in handleImagesUpload:', error);
        return imageRecords;
    }
};