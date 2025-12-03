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
        // Create unique filename with timestamp
        const timestamp = new Date().getTime();
        const fileExtension = path.extname(pdf.originalname);
        const newFileName = `${experienceId}_${timestamp}${fileExtension}`;
        const filePath = path.join(experienceDirPath, newFileName);
        
        // Verify source file exists and is valid
        if (!fs.existsSync(pdf.path) || pdf.size === 0) {
            return null;
        }

        // Copy file to destination
        fs.copyFileSync(pdf.path, filePath);

        // Create database record
        const pdfPath = `/pdfs/${experienceId}/${newFileName}`;
        const pdfRecord = await ExperiencePDF.create({
            experience_id: experienceId,
            name: newFileName,
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

