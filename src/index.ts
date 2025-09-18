import express from 'express';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import seasonRoutes from './routes/season.routes';
import categoryRoutes from './routes/category.routes';
import experienceRoutes from './routes/experience.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
        let experience_id;
        if (req.method === 'PUT') {
            experience_id = req.params.id;
        } else if (req.method === 'POST') {
            // For POST, we'll move files after creating the experience
            experience_id = 'new';
        }

        const type = file.fieldname === 'video' ? 'videos' : 'images';
        const dir = path.join(__dirname, '..', type, experience_id.toString());
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req: any, file: any, cb: any) => {
        const timestamp = new Date().getTime();
        const ext = path.extname(file.originalname);
        const experience_id = req.method === 'PUT' ? req.params.id : 'new';
        cb(null, `${experience_id}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
        console.log('\n=== Multer File Filter ===');
        console.log('Received file:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
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
            console.log('Accepting file:', file.fieldname);
            cb(null, true);
        } else {
            console.log('Rejecting file:', file.fieldname);
            cb(null, false);
        }
        console.log('======================\n');
    }
});

// Configure multer middleware for file uploads
const fileUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

// Handle multipart form data for both POST and PUT
app.use((req, res, next) => {
    console.log('\n=== Multer Middleware Debug ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Is multipart?', req.is('multipart/form-data'));
    
    // Process multipart form data for both POST and PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.is('multipart/form-data')) {
        console.log('Processing multipart form data...');
        fileUpload(req, res, (err: any) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({
                    success: false,
                    message: 'Error processing form data',
                    error: err.message
                });
            }
            console.log('Multer processed files:', req.files);
            next();
        });
    } else {
        console.log('Not a multipart request or not POST/PUT, skipping multer');
        next();
    }
    console.log('======================\n');
});

// Debug middleware to log request details
app.use((req, res, next) => {
    console.log('\n=== Request Debug ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('===================\n');
    next();
});

// Debug middleware to log raw request
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('\n=== Raw Request ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw Body:', req.body);
    console.log('=================\n');
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Body:', req.body);
  console.log('=====================\n');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Activities API' });
});

// Season routes with explicit path
const seasonBasePath = '/api/season';
console.log(`Registering season routes at ${seasonBasePath}`);

// Debug middleware for season routes
app.use(seasonBasePath, (req, res, next) => {
  console.log(`Season route hit: ${req.method} ${req.path}`);
  next();
});

app.use(seasonBasePath, seasonRoutes);

// Category routes
const categoryBasePath = '/api/category';
app.use(categoryBasePath, categoryRoutes);

// Experience routes
const experienceBasePath = '/api/experience';

// Move route registration before any other middleware
app.use(experienceBasePath, experienceRoutes);

console.log('\n=== Route Registration Debug ===');
console.log('Experience base path:', experienceBasePath);
console.log('Available routes:');
console.log('- POST /api/experience');
console.log('- PUT /api/experience/:id');
console.log('- GET /api/experience/site/:siteId');

// Add route debugging middleware
app.use('*', (req, res, next) => {
  console.log('\n=== Request Debug ===');
  console.log('Method:', req.method);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('Route found:', req.route ? 'Yes' : 'No');
  next();
});

// Log all registered routes
console.log('\n=== Registered Routes ===');
console.log('Season Routes:');
console.log(`POST ${seasonBasePath}`);
console.log(`GET ${seasonBasePath}/:id`);
console.log(`PUT ${seasonBasePath}/:id`);
console.log(`DELETE ${seasonBasePath}/:id`);

console.log('\nExperience Routes:');
console.log(`POST ${experienceBasePath}`);
console.log(`PUT ${experienceBasePath}/:id`);
console.log(`GET ${experienceBasePath}/site/:siteId`);

// 404 handler - with more specific error handling
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  console.log('Available routes were not matched');
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
