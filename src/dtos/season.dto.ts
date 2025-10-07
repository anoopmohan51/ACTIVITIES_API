export interface UpdateSeasonDto {
  name?: string;
  start_month?: string | null;
  end_month?: string | null;
  created_user?: string | null;
  updated_user?: string | null;
  company_id?: string | null;
  site_id?: string | null;
}

export interface CreateSeasonDto {
  name: string;
  start_month: string | null;
  end_month: string | null;
  company_id: string | null;
  site_id: string | null;
  created_user: string | null;
  updated_user: string | null;
}
