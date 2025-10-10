import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

// Middleware to log route matching
router.use((req, res, next) => {
  console.log('\nWorkflow Router - Incoming request:');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Params:', req.params);
  console.log('Route stack:', router.stack.map(r => r.route?.path));
  next();
});

// Define routes
router.post('/', workflowController.createApprovalLevels);
router.get('/company/:companyId', workflowController.getApprovalLevelsByCompany);
router.put('/company/:companyId', workflowController.updateApprovalLevelsByCompany);
router.delete('/company/:companyId', workflowController.deleteApprovalLevelsByCompany);
router.get('/:id', workflowController.getApprovalLevelById);

export default router;
