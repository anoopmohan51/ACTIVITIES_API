import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export class FileController {
  /**
   * Serve files dynamically based on type (images or videos)
   * URL: /api/files/:id/:filename?type=images|videos
   */
  serveFile(req: Request, res: Response): void {
    const { id, filename } = req.params;
    const type = req.query.type as string;

    // Validate type parameter
    if (!type || (type !== 'images' && type !== 'videos')) {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing type parameter',
        error: 'Type must be either "images" or "videos"'
      });
      return;
    }

    // Construct file path based on type
    const filePath = path.join(__dirname, '..', '..', type, id, filename);

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
      '.mkv': 'video/x-matroska'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file',
          error: err.message
        });
      }
    });
  }
}

