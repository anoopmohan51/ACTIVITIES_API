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
    filename?: string;
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
        
        // Check if file is already in the final destination (PUT request - multer already saved it)
        const normalizedVideoPath = path.normalize(video.path);
        const normalizedDestPath = path.normalize(experienceDirPath);
        const isAlreadyInDestination = normalizedVideoPath.startsWith(normalizedDestPath + path.sep);

        let finalFileName: string;
        let finalFilePath: string;

        if (isAlreadyInDestination) {
            // File is already saved by multer, use the multer filename directly
            finalFileName = video.filename || path.basename(video.path);
            finalFilePath = video.path; // Use the existing file path
        } else {
            // File is in temp directory (POST request), move it to final destination
            // Create timestamp for unique file name
            const timestamp = new Date().getTime();
            finalFileName = `${experience_id}_${timestamp}${fileExtension}`;
            finalFilePath = path.join(experienceDirPath, finalFileName);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(experienceDirPath)) {
                fs.mkdirSync(experienceDirPath, { recursive: true });
            }
            
            // Move the file using streams
            await new Promise<void>((resolve, reject) => {
                const readStream = fs.createReadStream(video.path);
                const writeStream = fs.createWriteStream(finalFilePath);
                
                readStream.on('error', reject);
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);
                
                readStream.pipe(writeStream);
            });
            
            // Delete the temporary file
            fs.unlinkSync(video.path);
        }
        
        // Create new video record in database (append mode - don't delete existing)
        // Note: name field stores the original filename for consistency with DELETE endpoint
        const videoRecord = await ExperienceVideo.create({
            experience_id,
            name: originalFileName,
            path: `/videos/${experience_id}/${finalFileName}`,
            uploaded_file_name: originalFileName
        });
        
        return videoRecord;
    } catch (error) {
        throw error;
    }
};
