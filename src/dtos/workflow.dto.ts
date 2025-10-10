export interface ApprovalMappingDto {
  id?: number;
  workflow_id: number;
  user_id: number;
  user_group?: string | null;
  user_group_id?: number | null;
}

export interface CreateApprovalLevelDto {
  company_id: string;
  level: number;
  approval_mapping: ApprovalMappingDto[];
}

export interface UpdateApprovalLevelDto {
  id?: number;
  level: number;
  company_id: string;
  created_user?: string | null;
  updated_user?: string | null;
  is_delete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  levelMappings: ApprovalMappingDto[];
}

export interface CreateWorkflowDto {
  approval_levels: CreateApprovalLevelDto[];
}

export interface UpdateWorkflowDto {
  approval_levels: UpdateApprovalLevelDto[];
}
