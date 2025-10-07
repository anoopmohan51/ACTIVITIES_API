import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { handleSuccessResponse, handleErrorResponse } from '../utils/response.handler';

export const listCategoriesBySite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteId = req.params.siteId;
    const limit = parseInt(req.query.limit as string) || 10;  // Default limit to 10
    const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID is required',
        error: 'Site ID must be provided'
      });
    }

    // Get total count of all records
    const total_count = await Category.count({
      where: {
        site_id: siteId,
        is_delete: false
      }
    });

    // Get paginated records
    const categories = await Category.findAll({
      where: {
        site_id: siteId,
        is_delete: false
      },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      count: categories.length,
      total_count
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
        error: 'ID must be a number'
      });
    }

    // Check if category exists and is not already deleted
    const category = await Category.findOne({
      where: {
        id: categoryId,
        is_delete: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'The requested category does not exist or has already been deleted'
      });
    }

    // Soft delete by setting is_delete to true
    await category.update({
      is_delete: true
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
        error: 'ID must be a number'
      });
    }

    // First check if category exists and is not deleted
    const existingCategory = await Category.findOne({
      where: {
        id: categoryId,
        is_delete: false
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'The requested category does not exist or has been deleted'
      });
    }

    // Update the category
    const { name, description, company_id, site_id, updated_user } = req.body;
    
    await existingCategory.update({
      name,
      description,
      company_id,
      site_id,
      updated_user
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: existingCategory
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID',
        error: 'ID must be a number'
      });
    }

    const category = await Category.findOne({
      where: {
        id: categoryId,
        is_delete: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'The requested category does not exist or has been deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, company_id, site_id, is_delete,created_user} = req.body;

    const category = await Category.create({
      name,
      description,
      company_id,
      site_id,
      is_delete: is_delete || false,
      created_user: created_user,
      updated_user: null
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const filterCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { site_id, company_id } = req.body;
    const { limit, offset } = req.query;
    
    // Parse limit and offset with defaults
    const parsedLimit = limit ? parseInt(limit as string) : 10;
    const parsedOffset = offset ? parseInt(offset as string) : 0;
    
    // Validate limit and offset
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      handleErrorResponse(res, {
        statusCode: 400,
        message: 'Invalid limit parameter'
      });
      return;
    }
    
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      handleErrorResponse(res, {
        statusCode: 400,
        message: 'Invalid offset parameter'
      });
      return;
    }

    // Build where clause
    const whereClause: any = {
      is_delete: false
    };

    if (site_id) {
      whereClause.site_id = site_id;
    }

    if (company_id) {
      whereClause.company_id = company_id;
    }

    // Get total count
    const total = await Category.count({
      where: whereClause
    });

    // Get paginated results
    const categories = await Category.findAll({
      where: whereClause,
      limit: Math.min(parsedLimit, 100), // Cap at 100 to prevent abuse
      offset: Math.max(parsedOffset, 0), // Ensure offset is not negative
      order: [['createdAt', 'DESC']]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parsedLimit);
    const currentPage = Math.floor(parsedOffset / parsedLimit) + 1;

    handleSuccessResponse(res, {
      message: 'Categories filtered successfully',
      data: {
        categories: categories,
        pagination: {
          total: total,
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
      message: 'Failed to filter categories',
      name: 'FilterError'
    });
  }
};