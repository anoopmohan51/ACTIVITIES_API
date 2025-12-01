import { Router } from 'express';
import { FileController } from '../controllers/file.controller';

const router = Router();
const fileController = new FileController();

// Dynamic file serving route
// GET /api/files/:id/:filename?type=images|videos|pdfs
router.get('/:id/:filename', fileController.serveFile);

export default router;

