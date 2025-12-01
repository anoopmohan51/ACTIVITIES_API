import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export class FileController {
  /**
   * Serve files dynamically based on type (images, videos, or pdfs)
   * URL: /api/files/:id/:filename?type=images|videos|pdfs
   */
  serveFile(req: Request, res: Response): void {
    const { id, filename } = req.params;
    const type = req.query.type as string;

    // Validate type parameter
    if (!type || (type !== 'images' && type !== 'videos' && type !== 'pdfs')) {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing type parameter',
        error: 'Type must be either "images", "videos", or "pdfs"'
      });
      return;
    }

    // Construct file path based on type
    // Use path.resolve() to ensure we get an absolute path (required for res.sendFile)
    const filePath = path.resolve(process.cwd(), type, id, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found',
        error: `File ${id}/${filename} does not exist in ${type} folder`
      });
      return;
    }

    // Check if it's a file (not a directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      res.status(404).json({
        success: false,
        message: 'File not found',
        error: `Path ${id}/${filename} is not a file`
      });
      return;
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      // Image types
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      // Video types
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
      // PDF types
      '.pdf': 'application/pdf'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Set headers before sending
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // For PDFs, add Content-Disposition header for proper browser handling
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Accept-Ranges', 'bytes');
    }

    // Use Express sendFile method for proper binary file handling
    res.sendFile(filePath, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error reading file',
            error: err.message
          });
        }
      }
    });
  }
}

