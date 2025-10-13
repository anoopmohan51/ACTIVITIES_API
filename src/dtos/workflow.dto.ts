export interface ApprovalMappingDto {
  id?: number;
  workflow_id?: number;
  approvallevels?: number;
  user_id?: number | string | null;
  user_group?: string | null;
  user_group_id?: number | null;
  usergroup?: string | null;
  variable?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateApprovalLevelDto {
  company_id: string;
  level: number;
  type?: string | null;
  approval_mapping: ApprovalMappingDto[];
}

export interface UpdateApprovalLevelDto {
  id?: number;
  level: number;
  type?: string | null;
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
