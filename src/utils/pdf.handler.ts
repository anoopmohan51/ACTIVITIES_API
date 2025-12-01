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
        // Get existing PDFs
        const existingPDFs = await ExperiencePDF.findAll({
            where: { experience_id: experienceId }
        });

        // Handle case when no new PDFs are provided
        if (!pdfs || pdfs.length === 0) {
            // Delete all existing files and records
            for (const pdf of existingPDFs) {
                // Resolve path relative to project root (pdf.path is like /pdfs/13/file.pdf)
                const filePath = path.join(__dirname, '..', '..', pdf.path);
                deleteFileIfExists(filePath);
                await pdf.destroy();
            }

            // Remove empty directory if it exists
            if (fs.existsSync(experienceDirPath)) {
                try {
                    // Try to remove directory (only works if empty)
                    fs.rmdirSync(experienceDirPath);
                } catch (error) {
                    // Directory might not be empty or already deleted
                }
            }
            
            return pdfRecords;
        }

        // Always delete all existing PDFs and files first when new PDFs are provided
        // Delete all files from database records
        for (const existingPDF of existingPDFs) {
            // Resolve path relative to project root (pdf.path is like /pdfs/13/file.pdf)
            const filePath = path.join(__dirname, '..', '..', existingPDF.path);
            deleteFileIfExists(filePath);
            await existingPDF.destroy();
        }

        // Ensure directory exists for new uploads
        ensureDirectory(experienceDirPath);

        // Process and save all new PDFs
        for (const pdf of pdfs) {
            const newPDFRecord = await savePDFAndCreateRecord(pdf, experienceId, experienceDirPath);
            if (newPDFRecord) {
                pdfRecords.push(newPDFRecord);
            }
        }

        // Delete orphaned files: files in directory but NOT in database (after saving new PDFs)
        // Fetch all valid PDFs from database to ensure we have the complete list
        const validPDFsInDb = await ExperiencePDF.findAll({
            where: { experience_id: experienceId }
        });

        if (fs.existsSync(experienceDirPath)) {
            try {
                // Get all files in the directory
                const filesInDirectory = fs.readdirSync(experienceDirPath);
                
                // Get all valid file names from database
                const validFileNames = new Set(
                    validPDFsInDb.map(pdf => {
                        // Extract filename from path (e.g., /pdfs/13/file.pdf -> file.pdf)
                        return path.basename(pdf.path);
                    })
                );
                
                // Delete files that are not in the database
                for (const file of filesInDirectory) {
                    const filePath = path.join(experienceDirPath, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.isFile() && !validFileNames.has(file)) {
                        deleteFileIfExists(filePath);
                    }
                }
            } catch (error) {
            }
        }

        return pdfRecords;
    } catch (error) {
        return pdfRecords;
    }
};

