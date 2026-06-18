import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'admin', 'agency_owner', 'team_member').required(),
});

const toggleStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const validateUpdateRole = [Validator.validate({ body: updateRoleSchema })];
export const validateToggleStatus = [Validator.validate({ body: toggleStatusSchema })];
export const validatePagination = [Validator.validate({ query: paginationSchema })];
