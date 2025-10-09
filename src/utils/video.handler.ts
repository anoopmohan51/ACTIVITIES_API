import fs from 'fs';
import path from 'path';
import { ExperienceVideo } from '../models/ExperienceVideo';

interface VideoFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path: string;
    size: number;
}

export const handleVideoUpload = async (video: VideoFile | null, experience_id: number): Promise<ExperienceVideo | null> => {
    try {
        // Get the experience directory path
        const experienceDirPath = path.join(__dirname, '..', '..', 'videos', experience_id.toString());

        // Find existing videos for this experience
        const existingVideos = await ExperienceVideo.findAll({
            where: { experience_id }
        });

        // If video is null or undefined, remove all existing videos
        if (!video) {
            console.log(`Removing all videos for experience ${experience_id}`);
            
            // Delete all files in the experience directory
            if (fs.existsSync(experienceDirPath)) {
                const files = fs.readdirSync(experienceDirPath);
                for (const file of files) {
                    const filePath = path.join(experienceDirPath, file);
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    } catch (error) {
                        console.error(`Error deleting file ${filePath}:`, error);
                    }
                }
                
                // Remove the empty directory
                try {
                    fs.rmdirSync(experienceDirPath);
                    console.log(`Removed directory: ${experienceDirPath}`);
                } catch (error) {
                    console.error(`Error removing directory ${experienceDirPath}:`, error);
                }
            }

            // Delete all database records
            for (const existingVideo of existingVideos) {
                await existingVideo.destroy();
                console.log(`Deleted video record: ${existingVideo.id}`);
            }

            return null;
        }

        // Handle new video upload
        console.log(`Uploading new video for experience ${experience_id}`);
        
        // Extract the original file name and extension
        const originalFileName = video.originalname;
        const fileExtension = path.extname(originalFileName);
        
        // Create timestamp for unique file name
        const timestamp = new Date().getTime();
        const newFileName = `${experience_id}_${timestamp}${fileExtension}`;
        const filePath = path.join(experienceDirPath, newFileName);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(experienceDirPath)) {
            fs.mkdirSync(experienceDirPath, { recursive: true });
        }
        
        // Move the file using streams
        await new Promise<void>((resolve, reject) => {
            const readStream = fs.createReadStream(video.path);
            const writeStream = fs.createWriteStream(filePath);
            
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            
            readStream.pipe(writeStream);
        });
        
        // Delete the temporary file
        fs.unlinkSync(video.path);
        
        // Delete all previous videos
        for (const existingVideo of existingVideos) {
            const existingFilePath = existingVideo.path;
            // Delete file if exists
            if (fs.existsSync(path.join(__dirname, '..', '..', existingFilePath))) {
                fs.unlinkSync(path.join(__dirname, '..', '..', existingFilePath));
                console.log(`Deleted old video file: ${existingFilePath}`);
            }
            // Delete database record
            await existingVideo.destroy();
            console.log(`Deleted old video record: ${existingVideo.id}`);
        }
        
        // Create new video record in database
        const videoRecord = await ExperienceVideo.create({
            experience_id,
            name: originalFileName,
            path: `/videos/${experience_id}/${newFileName}`,
            uploaded_file_name: originalFileName
        });
        
        console.log(`Created new video record: ${videoRecord.id}`);
        return videoRecord;
    } catch (error) {
        console.error('Error handling video upload:', error);
        throw error;
    }
};
