import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../../utils/AppError';

type ValidationSchemas = {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
};

export class Validator {
  static validate(schemas: ValidationSchemas) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const errors: string[] = [];

      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          errors.push(...error.details.map((d) => d.message));
        } else {
          req.body = schemas.body.validate(req.body, { stripUnknown: true }).value;
        }
      }

      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          errors.push(...error.details.map((d) => d.message));
        } else {
          req.query = schemas.query.validate(req.query, { stripUnknown: true }).value;
        }
      }

      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          errors.push(...error.details.map((d) => d.message));
        }
      }

      if (errors.length > 0) {
        next(new AppError(errors.join('; '), 400));
      } else {
        next();
      }
    };
  }
}

export const schemas = {
  auth: {
    register: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .message('Password must contain uppercase, lowercase, number, and special character')
        .required(),
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    forgotPassword: Joi.object({
      email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
      token: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
    }),
  },
  website: {
    create: Joi.object({
      businessName: Joi.string().min(2).max(100).required(),
      category: Joi.string().required(),
      location: Joi.string().max(200).required(),
      phone: Joi.string()
        .pattern(/^\+?[\d\s-]{10,15}$/)
        .required(),
      email: Joi.string().email().required(),
      template: Joi.string().optional(),
    }),
    update: Joi.object({
      businessName: Joi.string().min(2).max(100),
      category: Joi.string(),
      location: Joi.string().max(200),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/),
      email: Joi.string().email(),
      content: Joi.object(),
      branding: Joi.object(),
    }),
  },
  payment: {
    create: Joi.object({
      plan: Joi.string().valid('starter', 'professional', 'business', 'enterprise').required(),
      interval: Joi.string().valid('monthly', 'yearly').required(),
      provider: Joi.string().valid('stripe', 'razorpay').required(),
    }),
  },
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};
