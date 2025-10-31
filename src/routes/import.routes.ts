import { Router } from 'express';
import { importExperiences, upload } from '../controllers/import.controller';

const router = Router();

/**
 * @route POST /api/import/experiences
 * @desc Import experiences from JSON file
 * @access Private
 */
router.post('/experiences', upload.single('file'), importExperiences);

export default router;

