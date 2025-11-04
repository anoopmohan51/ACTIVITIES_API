import { ApprovalLevels } from '../models/ApprovalLevels';
import { LevelMapping } from '../models/LevelMapping';
import { CreateWorkflowDto, CreateApprovalLevelDto, UpdateWorkflowDto, UpdateApprovalLevelDto } from '../dtos/workflow.dto';

export class WorkflowService {
  /**
   * Create approval levels and their mappings
   * @param workflowData - Array of approval level data
   * @returns Created approval levels with their mappings
   */
  public async createApprovalLevels(workflowData: any[]): Promise<any[]> {
    const results = [];
    const seenCombinations = new Set<string>(); // Track company_id + level combinations in this batch

    for (const approvalLevelData of workflowData) {
      const { company_id, level, type, levelMappings, created_user, updated_user } = approvalLevelData;

      // Check for duplicates within the same batch
      const combinationKey = `${company_id}_${level}`;
      if (seenCombinations.has(combinationKey)) {
        throw new Error(`Duplicate approval level ${level} for company_id: ${company_id} in the same request`);
      }
      seenCombinations.add(combinationKey);

      // Create the approval level
      const approvalLevel = await ApprovalLevels.create({
        company_id,
        level,
        type: type || null,
        created_user: created_user || 'system',
        updated_user: updated_user || 'system',
        is_delete: false
      });

      // Create level mappings
      const levelMappingsResult = [];
      if (levelMappings && Array.isArray(levelMappings)) {
        for (const mapping of levelMappings) {
          const levelMapping = await LevelMapping.create({
            approvallevels: approvalLevel.id,
            user_id: mapping.user_id?.toString() || null,
            usergroup: mapping.usergroup?.toString() || null
          });
          levelMappingsResult.push(levelMapping);
        }
      }

      results.push({
        approval_level: approvalLevel,
        level_mappings: levelMappingsResult
      });
    }

    return results;
  }

  /**
   * Get approval levels by company ID
   * @param companyId - Company ID to search for
   * @returns Array of approval levels with their mappings
   */
  public async getApprovalLevelsByCompany(companyId: string): Promise<any[]> {
    const approvalLevels = await ApprovalLevels.findAll({
      where: {
        company_id: companyId,
        is_delete: false
      },
      include: [
        {
          model: LevelMapping,
          as: 'levelMappings',
          required: false,
          attributes: ['id', 'approvallevels', 'user_id', 'usergroup', 'createdAt', 'updatedAt']
        }
      ]
    });

    return approvalLevels;
  }

  /**
   * Get approval level by ID
   * @param id - Approval level ID
   * @returns Approval level with its mappings
   */
  public async getApprovalLevelById(id: number): Promise<any> {
    const approvalLevel = await ApprovalLevels.findOne({
      where: {
        id: id,
        is_delete: false
      },
      include: [
        {
          model: LevelMapping,
          as: 'levelMappings',
          required: false,
          attributes: ['id', 'approvallevels', 'user_id', 'usergroup', 'createdAt', 'updatedAt']
        }
      ]
    });

    return approvalLevel;
  }

  /**
   * Update approval levels and their mappings (upsert operation)
   * @param companyId - Company ID to update approval levels for
   * @param workflowData - Array of approval level data to upsert
   * @returns Updated approval levels with their mappings
   */
  public async updateApprovalLevelsByCompany(companyId: string, workflowData: UpdateApprovalLevelDto[]): Promise<any[]> {
    const savedApprovalLevelIds: number[] = [];
    const results: any[] = [];

    // Process each approval level in the payload
    for (const approvalLevelData of workflowData) {
      const { id, level, type, levelMappings, company_id, ...otherFields } = approvalLevelData;
      
      let approvalLevel: any;
      
      if (id) {
        // Update existing approval level
        await ApprovalLevels.update(
          {
            level,
            type: type || null,
            updated_user: 'system', // You might want to pass this from the request
            ...otherFields
          },
          {
            where: {
              id: id,
              company_id: companyId,
              is_delete: false
            }
          }
        );
        
        approvalLevel = await ApprovalLevels.findByPk(id);
      } else {
        // Create new approval level
        approvalLevel = await ApprovalLevels.create({
          level,
          type: type || null,
          created_user: 'system', // You might want to pass this from the request
          updated_user: 'system',
          is_delete: false,
          company_id: companyId,
          ...otherFields
        });
      }

      if (approvalLevel) {
        savedApprovalLevelIds.push(approvalLevel.id);
        
        // Process level mappings for this approval level
        const savedLevelMappingIds: number[] = [];
        
        for (const mapping of levelMappings) {
          const { id: mappingId, workflow_id, user_id, user_group, user_group_id, usergroup } = mapping;
          
          let levelMapping: any;
          
          if (mappingId) {
            // Update existing level mapping
            await LevelMapping.update(
              {
                user_id: user_id?.toString() || null,
                usergroup: usergroup?.toString() || null
              },
              {
                where: {
                  id: mappingId,
                  approvallevels: approvalLevel.id
                }
              }
            );
            
            levelMapping = await LevelMapping.findByPk(mappingId, {
              attributes: ['id', 'approvallevels', 'user_id', 'usergroup', 'createdAt', 'updatedAt']
            });
          } else {
            // Create new level mapping
            levelMapping = await LevelMapping.create({
              approvallevels: approvalLevel.id,
              user_id: user_id?.toString() || null,
              usergroup: usergroup?.toString() || null
            });
          }
          
          if (levelMapping) {
            savedLevelMappingIds.push(levelMapping.id);
          }
        }
        
        // Delete level mappings not in the saved IDs for this approval level
        await LevelMapping.destroy({
          where: {
            approvallevels: approvalLevel.id,
            id: {
              [require('sequelize').Op.notIn]: savedLevelMappingIds
            }
          }
        });
        
        // Fetch the approval level with its mappings
        const approvalLevelWithMappings = await ApprovalLevels.findByPk(approvalLevel.id, {
          include: [
            {
              model: LevelMapping,
              as: 'levelMappings',
              required: false,
              attributes: ['id', 'approvallevels', 'user_id', 'usergroup', 'createdAt', 'updatedAt']
            }
          ]
        });
        
        results.push(approvalLevelWithMappings);
      }
    }

    // Soft delete approval levels not in the saved IDs for this company
    // First, find all approval levels that will be soft deleted
    const approvalLevelsToDelete = await ApprovalLevels.findAll({
      where: {
        company_id: companyId,
        is_delete: false,
        id: {
          [require('sequelize').Op.notIn]: savedApprovalLevelIds
        }
      }
    });

    // Delete level mappings for approval levels that will be soft deleted
    for (const approvalLevelToDelete of approvalLevelsToDelete) {
      await LevelMapping.destroy({
        where: {
          approvallevels: approvalLevelToDelete.id
        }
      });
    }

    // Now soft delete the approval levels by setting is_delete to true
    await ApprovalLevels.update(
      { is_delete: true },
      {
        where: {
          company_id: companyId,
          is_delete: false,
          id: {
            [require('sequelize').Op.notIn]: savedApprovalLevelIds
          }
        }
      }
    );

    return results;
  }

  /**
   * Delete all approval levels and their mappings for a company
   * @param companyId - Company ID to delete approval levels for
   * @returns Success message
   */
  public async deleteApprovalLevelsByCompany(companyId: string): Promise<{ message: string; deletedCount: number }> {
    // First, find all approval levels for this company
    const approvalLevelsToDelete = await ApprovalLevels.findAll({
      where: {
        company_id: companyId,
        is_delete: false
      }
    });

    let deletedCount = 0;

    if (approvalLevelsToDelete.length > 0) {
      // Soft delete all level mappings for these approval levels
      for (const approvalLevel of approvalLevelsToDelete) {
        await LevelMapping.destroy({
          where: {
            approvallevels: approvalLevel.id
          }
        });
      }

      // Soft delete all approval levels for this company by setting is_delete to true
      await ApprovalLevels.update(
        { is_delete: true },
        {
          where: {
            company_id: companyId,
            is_delete: false
          }
        }
      );

      deletedCount = approvalLevelsToDelete.length;
    }

    return {
      message: `Successfully deleted ${deletedCount} approval level(s) and their mappings for company ${companyId}`,
      deletedCount
    };
  }
}
