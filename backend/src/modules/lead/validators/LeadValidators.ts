import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'lost').required(),
});

const assignSchema = Joi.object({
  assignedTo: Joi.string().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'converted', 'lost').optional(),
});

export const validateUpdateStatus = [Validator.validate({ body: updateStatusSchema })];
export const validateAssign = [Validator.validate({ body: assignSchema })];
export const validatePagination = [Validator.validate({ query: paginationSchema })];
