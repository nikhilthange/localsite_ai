import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError';
import { Logger } from '../logging/Logger';
import config from '../../config';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: any;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  Logger.error('Error caught by handler', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
    };
    if (config.isDevelopment) {
      response.stack = err.stack;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.message,
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: 'Duplicate value for ' + (field || 'field'),
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: config.isProduction ? 'Internal server error' : err.message,
    stack: config.isDevelopment ? err.stack : undefined,
  });
}
