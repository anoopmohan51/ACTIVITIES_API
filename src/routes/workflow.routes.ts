import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

// Middleware to log route matching
router.use((req, res, next) => {
  next();
});

// Define routes
router.post('/', workflowController.createApprovalLevels);
router.get('/company/:companyId', workflowController.getApprovalLevelsByCompany);
router.put('/company/:companyId', workflowController.updateApprovalLevelsByCompany);
router.delete('/company/:companyId', workflowController.deleteApprovalLevelsByCompany);
router.get('/:id', workflowController.getApprovalLevelById);

export default router;
