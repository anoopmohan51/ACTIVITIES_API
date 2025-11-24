import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

// GET /api/workflow_level_mapping?experience_id=1&level=1
router.get('/', workflowController.getWorkflowLevelMapping);

export default router;

