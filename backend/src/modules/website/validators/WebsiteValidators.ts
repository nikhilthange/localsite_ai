import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const createWebsiteSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required(),
  category: Joi.string().required(),
  location: Joi.string().max(200).required(),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).required(),
  email: Joi.string().email().required(),
  template: Joi.string().optional(),
});

const updateWebsiteSchema = Joi.object({
  businessName: Joi.string().min(2).max(100),
  category: Joi.string(),
  location: Joi.string().max(200),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/),
  email: Joi.string().email(),
  content: Joi.object(),
  branding: Joi.object(),
  domain: Joi.string(),
}).min(1);

export const validateCreateWebsite = [Validator.validate({ body: createWebsiteSchema })];
export const validateUpdateWebsite = [Validator.validate({ body: updateWebsiteSchema })];
