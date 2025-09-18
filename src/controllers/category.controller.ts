import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';

export const listCategoriesBySite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteId = req.params.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID is required',
        error: 'Site ID must be provided'
      });
    }

    const categories = await Category.findAll({
      where: {
        site_id: siteId,
        is_delete: false
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
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
    const { name, description, company_id, site_id, is_delete } = req.body;

    const category = await Category.create({
      name,
      description,
      company_id,
      site_id,
      is_delete: is_delete || false,
      created_user: null, // You can add user authentication later
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
