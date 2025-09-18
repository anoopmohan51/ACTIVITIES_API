import { Router } from 'express';
import { SeasonController } from '../controllers/season.controller';

const router = Router();
const seasonController = new SeasonController();

// Middleware to log route matching
router.use((req, res, next) => {
  console.log('\nSeason Router - Incoming request:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Params:', req.params);
  console.log('Route stack:', router.stack.map(r => r.route?.path));
  next();
});

// Define routes
router.post('/', seasonController.createSeason);

// Get seasons by site ID
router.get('/site/:siteId', seasonController.getSeasonsBySiteId);

// Individual routes for better visibility and debugging
router.get('/:id', seasonController.getSeasonById);
router.put('/:id', seasonController.updateSeason);
router.delete('/:id', seasonController.deleteSeason);

export default router;
