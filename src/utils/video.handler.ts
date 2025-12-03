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
        // Only process if video is provided
        if (!video) {
            return null;
        }

        // Get the experience directory path
        const experienceDirPath = path.join(__dirname, '..', '..', 'videos', experience_id.toString());

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
        
        // Create new video record in database (append mode - don't delete existing)
        const videoRecord = await ExperienceVideo.create({
            experience_id,
            name: newFileName,
            path: `/videos/${experience_id}/${newFileName}`,
            uploaded_file_name: originalFileName
        });
        
        return videoRecord;
    } catch (error) {
        throw error;
    }
};
