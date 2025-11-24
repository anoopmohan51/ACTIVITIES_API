import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { CreateWorkflowDto, UpdateApprovalLevelDto } from '../dtos/workflow.dto';
import { handleSuccessResponse, handleErrorResponse } from '../utils/response.handler';
import { ApprovalLevels } from '../models/ApprovalLevels';

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  /**
   * Create approval levels and their mappings
   * POST /api/workflow
   */
  public createApprovalLevels = async (req: Request, res: Response): Promise<void> => {
    try {
      const workflowData: any[] = req.body;

      // Validate request body - expect direct array
      if (!Array.isArray(workflowData)) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Request body must be an array of approval levels'
        });
        return;
      }

      // Validate each approval level
      for (const approvalLevel of workflowData) {
        if (!approvalLevel.company_id || !approvalLevel.level) {
          handleErrorResponse(res, {
            statusCode: 400,
            message: 'Each approval level must have company_id and level'
          });
          return;
        }

        if (approvalLevel.levelMappings && !Array.isArray(approvalLevel.levelMappings)) {
          handleErrorResponse(res, {
            statusCode: 400,
            message: 'levelMappings must be an array'
          });
          return;
        }

        // Check if approval level already exists for this company_id AND level combination
        // const existingApprovalLevel = await ApprovalLevels.findOne({
        //   where: {
        //     company_id: approvalLevel.company_id,
        //     level: approvalLevel.level,
        //     is_delete: false
        //   }
        // });

        // if (existingApprovalLevel) {
        //   handleErrorResponse(res, {
        //     statusCode: 400,
        //     message: `Approval level ${approvalLevel.level} already exists for company_id: ${approvalLevel.company_id}`
        //   });
        //  return;
        // } 
      }

      const result = await this.workflowService.createApprovalLevels(workflowData);

      handleSuccessResponse(res, {
        message: 'Approval levels created successfully',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: `Failed to create approval levels: ${errorMessage}`
      });
    }
  };

  /**
   * Get approval levels by company ID
   * GET /api/workflow/company/:companyId
   */
  public getApprovalLevelsByCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = req.params.companyId;

      if (!companyId) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Company ID is required'
        });
        return;
      }

      const result = await this.workflowService.getApprovalLevelsByCompany(companyId);

      if (!result || result.length === 0) {
        handleErrorResponse(res, {
          statusCode: 404,
          message: 'No approval levels found for this company'
        });
        return;
      }

      handleSuccessResponse(res, {
        message: 'Approval levels retrieved successfully',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: `Failed to retrieve approval levels: ${errorMessage}`
      });
    }
  };

  /**
   * Get approval level by ID
   * GET /api/workflow/:id
   */
  public getApprovalLevelById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Invalid approval level ID'
        });
        return;
      }

      const result = await this.workflowService.getApprovalLevelById(id);

      if (!result) {
        handleErrorResponse(res, {
          statusCode: 404,
          message: 'Approval level not found'
        });
        return;
      }

      handleSuccessResponse(res, {
        message: 'Approval level retrieved successfully',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: `Failed to retrieve approval level: ${errorMessage}`
      });
    }
  };

  /**
   * Update approval levels by company ID (upsert operation)
   * PUT /api/workflow/company/:companyId
   */
  public updateApprovalLevelsByCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = req.params.companyId;
      const workflowData: UpdateApprovalLevelDto[] = req.body;

      // Validate request body - expect direct array
      if (!Array.isArray(workflowData)) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Request body must be an array of approval levels'
        });
        return;
      }

      if (!companyId) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Company ID is required'
        });
        return;
      }

      // Validate each approval level
      for (const approvalLevel of workflowData) {
        if (!approvalLevel.level || !approvalLevel.levelMappings) {
          handleErrorResponse(res, {
            statusCode: 400,
            message: 'Each approval level must have level and levelMappings'
          });
          return;
        }

        if (!Array.isArray(approvalLevel.levelMappings)) {
          handleErrorResponse(res, {
            statusCode: 400,
            message: 'levelMappings must be an array'
          });
          return;
        }

        // Validate each mapping
        for (const mapping of approvalLevel.levelMappings) {
          if (!mapping.user_id && !mapping.user_group && !mapping.user_group_id && !mapping.usergroup) {
            handleErrorResponse(res, {
              statusCode: 400,
              message: 'Each mapping must have either user_id, user_group, user_group_id, or usergroup'
            });
            return;
          }
        }
      }

      const result = await this.workflowService.updateApprovalLevelsByCompany(companyId, workflowData);

      handleSuccessResponse(res, {
        message: 'Approval levels updated successfully',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: `Failed to update approval levels: ${errorMessage}`
      });
    }
  };

  /**
   * Delete all approval levels by company ID
   * DELETE /api/workflow/company/:companyId
   */
  public deleteApprovalLevelsByCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = req.params.companyId;

      if (!companyId) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Company ID is required'
        });
        return;
      }

      const result = await this.workflowService.deleteApprovalLevelsByCompany(companyId);

      handleSuccessResponse(res, {
        message: result.message,
        data: {
          deletedCount: result.deletedCount,
          companyId: companyId
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: `Failed to delete approval levels: ${errorMessage}`
      });
    }
  };

  /**
   * Get workflow level mapping by experience_id and level
   * GET /api/workflow_level_mapping?experience_id=1&level=1
   */
  public getWorkflowLevelMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const experienceId = req.query.experience_id;
      const level = req.query.level;

      // Validate query parameters
      if (!experienceId || !level) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Both experience_id and level query parameters are required'
        });
        return;
      }

      const experienceIdNum = parseInt(experienceId as string);
      const levelNum = parseInt(level as string);

      if (isNaN(experienceIdNum)) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Invalid experience_id parameter'
        });
        return;
      }

      if (isNaN(levelNum)) {
        handleErrorResponse(res, {
          statusCode: 400,
          message: 'Invalid level parameter'
        });
        return;
      }

      const result = await this.workflowService.getWorkflowLevelMapping(experienceIdNum, levelNum);

      handleSuccessResponse(res, {
        message: 'Workflow level mapping retrieved successfully',
        data: result
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const statusCode = errorMessage.includes('not found') ? 404 : 500;
      handleErrorResponse(res, {
        statusCode,
        message: `Failed to retrieve workflow level mapping: ${errorMessage}`
      });
    }
  };
}
