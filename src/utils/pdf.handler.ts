import fs from 'fs';
import path from 'path';
import { ExperiencePDF } from '../models/ExperiencePDF';

interface PDFFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path: string;
    size: number;
    filename: string;
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

// Helper function to save PDF file and create database record
const savePDFAndCreateRecord = async (
    pdf: PDFFile,
    experienceId: number,
    experienceDirPath: string
): Promise<ExperiencePDF | null> => {
    try {
        // Verify source file exists and is valid
        if (!fs.existsSync(pdf.path) || pdf.size === 0) {
            return null;
        }

        // Check if file is already in the final destination (PUT request - multer already saved it)
        const normalizedPdfPath = path.normalize(pdf.path);
        const normalizedDestPath = path.normalize(experienceDirPath);
        const isAlreadyInDestination = normalizedPdfPath.startsWith(normalizedDestPath + path.sep);

        let finalFileName: string;
        let finalFilePath: string;

        if (isAlreadyInDestination) {
            // File is already saved by multer, use the multer filename directly
            finalFileName = pdf.filename || path.basename(pdf.path);
            finalFilePath = pdf.path; // Use the existing file path
        } else {
            // File is in temp directory (POST request), copy it to final destination
            const timestamp = new Date().getTime();
            const fileExtension = path.extname(pdf.originalname);
            finalFileName = `${experienceId}_${timestamp}${fileExtension}`;
            finalFilePath = path.join(experienceDirPath, finalFileName);
            
            // Copy file to destination
            fs.copyFileSync(pdf.path, finalFilePath);
        }

        // Create database record
        const pdfPath = `/pdfs/${experienceId}/${finalFileName}`;
        const pdfRecord = await ExperiencePDF.create({
            experience_id: experienceId,
            name: finalFileName,
            path: pdfPath,
            uploaded_file_name: pdf.originalname
        });

        return pdfRecord;
    } catch (error) {
        return null;
    }
};

export const handlePDFsUpload = async (pdfs: PDFFile[] | null, experienceId: number): Promise<ExperiencePDF[]> => {
    const pdfRecords: ExperiencePDF[] = [];
    const experienceDirPath = path.join(__dirname, '..', '..', 'pdfs', experienceId.toString());

    try {
        // Only process if PDFs are provided
        if (!pdfs || pdfs.length === 0) {
            return pdfRecords;
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);

        // Process and save all new PDFs (append mode - don't delete existing)
        for (const pdf of pdfs) {
            const newPDFRecord = await savePDFAndCreateRecord(pdf, experienceId, experienceDirPath);
            if (newPDFRecord) {
                pdfRecords.push(newPDFRecord);
            }
        }

        return pdfRecords;
    } catch (error) {
        return pdfRecords;
    }
};

