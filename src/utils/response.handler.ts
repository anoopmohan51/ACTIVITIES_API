import { Response } from 'express';

interface SuccessResponse {
    message: string;
    data?: any;
}

interface ValidationError {
    path: string;
    message: string;
}

interface ErrorResponse {
    statusCode?: number;
    message?: string;
    name?: string;
    errors?: ValidationError[];
}

export const handleSuccessResponse = (res: Response, { message, data }: SuccessResponse) => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

export const handleErrorResponse = (res: Response, error: ErrorResponse) => {
    console.error('Error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' && error.errors?.length) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.errors.map((err: ValidationError) => ({
                field: err.path,
                message: err.message
            }))
        });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors?.length) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry error',
            errors: error.errors.map((err: ValidationError) => ({
                field: err.path,
                message: err.message
            }))
        });
    }

    // Handle custom error responses
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Error occurred',
            errors: error.errors || []
        });
    }

    // Handle other errors
    return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
};