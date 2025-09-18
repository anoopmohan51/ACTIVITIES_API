import { Season, SeasonCreationAttributes } from '../models/Season';
import { CreateSeasonDto, UpdateSeasonDto } from '../dtos/season.dto';

export class SeasonService {
  public async updateSeason(id: number, data: UpdateSeasonDto): Promise<Season | null> {
    try {
      const season = await Season.findByPk(id);
      
      if (!season) {
        return null;
      }

      // Remove fields that shouldn't be updated
      delete (data as any).is_delete;
      delete (data as any).createdAt;
      delete (data as any).updatedAt;

      await season.update(data);
      return season;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error updating season: ${errorMessage}`);
    }
  }

  public async getSeasonById(id: number): Promise<Season | null> {
    try {
      const season = await Season.findOne({
        where: {
          id,
          is_delete: false
        }
      });
      return season;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching season: ${errorMessage}`);
    }
  }

  public async createSeason(data: CreateSeasonDto): Promise<Season> {
    try {
      const seasonData: SeasonCreationAttributes = {
        name: data.name,
        start_month: data.start_month,
        end_month: data.end_month,
        created_user: data.created_user,
        updated_user: data.updated_user,
        company_id: data.company_id,
        site_id: data.site_id,
        is_delete: false,
      };

      const season = await Season.create(seasonData);
      return season;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error creating season: ${errorMessage}`);
    }
  }

  public async getSeasonsBySiteId(siteId: string): Promise<Season[]> {
    try {
      const seasons = await Season.findAll({
        where: {
          site_id: siteId,
          is_delete: false
        },
        order: [['createdAt', 'DESC']]
      });
      return seasons;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error fetching seasons by site: ${errorMessage}`);
    }
  }

  public async deleteSeason(id: number): Promise<Season | null> {
    try {
      const season = await Season.findByPk(id);
      
      if (!season) {
        return null;
      }

      await season.update({ is_delete: true });
      return season;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error deleting season: ${errorMessage}`);
    }
  }
}