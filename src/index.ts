import express from 'express';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import seasonRoutes from './routes/season.routes';
import categoryRoutes from './routes/category.routes';
import experienceRoutes from './routes/experience.routes';
import workflowRoutes from './routes/workflow.routes';
import workflowLevelMappingRoutes from './routes/workflow_level_mapping.routes';
import importRoutes from './routes/import.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure middleware for request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from images and videos directories
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use('/videos', express.static(path.join(__dirname, '..', 'videos')));

// Configure multer for form-data parsing
const multer = require('multer');
// Configure multer disk storage
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        // Get experience_id from the URL for both POST and PUT requests
        let experience_id = 'temp';
        if (req.method === 'PUT') {
            // Extract ID from URL path for PUT requests
            const matches = req.originalUrl.match(/\/api\/experience\/(\d+)/);
            if (matches && matches[1]) {
                experience_id = matches[1];
            }
        }


        const type = file.fieldname === 'video' ? 'videos' : 'images';
        const dir = path.join(__dirname, '..', type, experience_id);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req: any, file: any, cb: any) => {
        const timestamp = new Date().getTime();
        const ext = path.extname(file.originalname);
        
        // Extract ID from URL path for PUT requests
        let experience_id = 'temp';
        if (req.method === 'PUT') {
            const matches = req.originalUrl.match(/\/api\/experience\/(\d+)/);
            if (matches && matches[1]) {
                experience_id = matches[1];
            }
        }


        cb(null, `${experience_id}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
        
        // Accept video and images
        if (file.fieldname === 'video' || file.fieldname === 'images') {
            if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
                cb(new Error('Only video files are allowed for video upload'));
                return;
            }
            if (file.fieldname === 'images' && !file.mimetype.startsWith('image/')) {
                cb(new Error('Only image files are allowed for image upload'));
                return;
            }
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Configure multer middleware for file uploads
const fileUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Handle multipart form data for both POST and PUT
app.use((req, res, next) => {
    // Skip global multer for import routes
    if (req.path.startsWith('/api/import')) {
        return next();
    }
    
    // Process multipart form data for both POST and PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.is('multipart/form-data')) {
        fileUpload(req, res, (err: any) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: 'Error processing form data',
                    error: err.message
                });
            }
            next();
        });
    } else {
        next();
    }
});




// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Activities API' });
});

// Season routes with explicit path
const seasonBasePath = '/api/seasons';


app.use(seasonBasePath, seasonRoutes);

// Category routes
const categoryBasePath = '/api/categories';
app.use(categoryBasePath, categoryRoutes);

// Experience routes
const experienceBasePath = '/api/experience';

// Move route registration before any other middleware
app.use(experienceBasePath, experienceRoutes);

// Workflow routes
const workflowBasePath = '/api/workflow';
app.use(workflowBasePath, workflowRoutes);

// Workflow level mapping routes
const workflowLevelMappingBasePath = '/api/workflow_level_mapping';
app.use(workflowLevelMappingBasePath, workflowLevelMappingRoutes);

// Import routes
const importBasePath = '/api/import';
app.use(importBasePath, importRoutes);

// 404 handler - with more specific error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: 'The requested endpoint does not exist'
  });
});

// Error handling middleware - should be last
app.use(errorHandler);

const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
