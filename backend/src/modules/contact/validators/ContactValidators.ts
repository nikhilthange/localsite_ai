import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const submitSchema = Joi.object({
  websiteId: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional().allow(''),
  message: Joi.string().min(10).max(5000).required(),
  source: Joi.string().default('contact-form'),
});

const getByWebsiteSchema = Joi.object({
  websiteId: Joi.string().required(),
});

const getByIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const validateContactSubmit = [Validator.validate({ body: submitSchema })];
export const validateGetByWebsite = [Validator.validate({ params: getByWebsiteSchema })];
export const validateGetById = [Validator.validate({ params: getByIdSchema })];
