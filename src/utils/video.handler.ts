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

export const handleVideoUpload = async (video: VideoFile, experience_id: number): Promise<ExperienceVideo> => {
    try {
        // Extract the original file name and extension
        const originalFileName = video.originalname;
        const fileExtension = path.extname(originalFileName);
        
        // Create timestamp for unique file name
        const timestamp = new Date().getTime();
        const newFileName = `${experience_id}_${timestamp}${fileExtension}`;
        
        // Create directory path for this experience
        const experienceDirPath = path.join(__dirname, '..', '..', 'videos', experience_id.toString());
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
        
        // Delete previous videos with the same experience_id pattern (excluding current)
        const existingVideos = await ExperienceVideo.findAll({
            where: { experience_id }
        });
        
        for (const existingVideo of existingVideos) {
            const existingFilePath = existingVideo.path;
            if (existingFilePath !== `/videos/${experience_id}/${newFileName}`) {
                // Delete file if exists
                if (fs.existsSync(path.join(__dirname, '..', '..', existingFilePath))) {
                    fs.unlinkSync(path.join(__dirname, '..', '..', existingFilePath));
                }
                // Delete database record
                await existingVideo.destroy();
            }
        }
        
        // Create new video record in database
        const videoRecord = await ExperienceVideo.create({
            experience_id,
            name: originalFileName,
            path: `/videos/${experience_id}/${newFileName}`,
            uploaded_file_name: originalFileName
        });
        
        return videoRecord;
    } catch (error) {
        console.error('Error handling video upload:', error);
        throw error;
    }
};
