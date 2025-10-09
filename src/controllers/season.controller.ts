import { Request, Response } from 'express';
import { SeasonService } from '../services/season.service';
import { CreateSeasonDto, UpdateSeasonDto } from '../dtos/season.dto';
import { handleSuccessResponse, handleErrorResponse } from '../utils/response.handler';

export class SeasonController {
  private seasonService: SeasonService;

  constructor() {
    this.seasonService = new SeasonService();
  }

  public updateSeason = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid season ID'
        });
        return;
      }

      const updateData: UpdateSeasonDto = req.body;


      const updatedSeason = await this.seasonService.updateSeason(id, updateData);
      
      if (!updatedSeason) {
        res.status(404).json({
          success: false,
          message: 'Season not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedSeason,
        message: 'Season updated successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to update season',
        error: errorMessage
      });
    }
  };

  public getSeasonById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid season ID'
        });
        return;
      }

      const season = await this.seasonService.getSeasonById(id);
      
      if (!season) {
        res.status(404).json({
          success: false,
          message: 'Season not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: season,
        message: 'Season fetched successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch season',
        error: errorMessage
      });
    }
  };

  public createSeason = async (req: Request, res: Response): Promise<void> => {
    try {
      const seasonData: CreateSeasonDto = req.body;
      const season = await this.seasonService.createSeason(seasonData);
      
      res.status(201).json({
        success: true,
        data: season,
        message: 'Season created successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to create season',
        error: errorMessage
      });
    }
  };

  public getSeasonsBySiteId = async (req: Request, res: Response): Promise<void> => {
    try {
      const siteId = req.params.siteId;
      
      if (!siteId) {
        res.status(400).json({
          success: false,
          message: 'Site ID is required'
        });
        return;
      }

      const seasons = await this.seasonService.getSeasonsBySiteId(siteId);
      
      res.status(200).json({
        success: true,
        data: seasons,
        message: 'Seasons fetched successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to fetch seasons',
        error: errorMessage
      });
    }
  };

  public deleteSeason = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid season ID'
        });
        return;
      }

      const deletedSeason = await this.seasonService.deleteSeason(id);
      
      if (!deletedSeason) {
        res.status(404).json({
          success: false,
          message: 'Season not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: deletedSeason,
        message: 'Season deleted successfully'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({
        success: false,
        message: 'Failed to delete season',
        error: errorMessage
      });
    }
  };

  public filterSeasons = async (req: Request, res: Response): Promise<void> => {
    try {
      const { site_id, company_id, limit, offset } = req.body;
      
      // Parse limit and offset with defaults
      const parsedLimit = limit ? parseInt(limit as string) : 10;
      const parsedOffset = offset ? parseInt(offset as string) : 0;
      
      // Validate limit and offset
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid limit parameter'
        });
        return;
      }
      
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid offset parameter'
        });
        return;
      }

      const filters = {
        site_id: site_id as string,
        company_id: company_id as string,
        limit: parsedLimit,
        offset: parsedOffset
      };

      const result = await this.seasonService.filterSeasons(filters);
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(result.total / parsedLimit);
      const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;

      handleSuccessResponse(res, {
        message: 'Seasons filtered successfully',
        data: {
          seasons: result.seasons,
          pagination: {
            total: result.total,
            totalPages,
            currentPage,
            limit: parsedLimit,
            offset: parsedOffset
          }
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      handleErrorResponse(res, {
        statusCode: 500,
        message: 'Failed to filter seasons',
        name: 'FilterError'
      });
    }
  };
}