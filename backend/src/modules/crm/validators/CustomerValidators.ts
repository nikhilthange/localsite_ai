import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const validatePagination = [Validator.validate({ query: paginationSchema })];
