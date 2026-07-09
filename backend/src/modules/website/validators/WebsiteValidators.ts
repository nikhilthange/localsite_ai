import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const createWebsiteSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required(),
  category: Joi.string().required(),
  location: Joi.string().max(200).required(),
  description: Joi.string().max(2000).optional().allow('').default(''),
  phone: Joi.string().optional().allow('').default(''),
  email: Joi.string().optional().allow('').default(''),
  template: Joi.string().optional().default('default'),
});

const generateCompleteSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required(),
  category: Joi.string().required(),
  location: Joi.string().max(200).required(),
  description: Joi.string().max(2000).optional().allow('').default(''),
  phone: Joi.string().optional().allow('').default(''),
  email: Joi.string().optional().allow('').default(''),
  website: Joi.string().uri().optional().allow('').default(''),
  address: Joi.string().optional().allow('').default(''),
  socialLinks: Joi.array().items(Joi.object({
    platform: Joi.string(), url: Joi.string().uri(),
  })).optional().default([]),
  theme: Joi.string().optional().default('modern'),
  primaryColor: Joi.string().pattern(/^#([0-9a-fA-F]{6})$/).optional(),
  secondaryColor: Joi.string().pattern(/^#([0-9a-fA-F]{6})$/).optional(),
  targetAudience: Joi.string().max(200).optional(),
  tone: Joi.string().valid('Professional', 'Friendly', 'Luxury', 'Energetic', 'Minimal', 'Bold').optional(),
  websiteStyle: Joi.string().valid('Modern', 'Classic', 'Minimal', 'Bold', 'Luxury', 'Playful', 'Corporate').optional(),
});

const updateWebsiteSchema = Joi.object({
  businessName: Joi.string().min(2).max(100),
  category: Joi.string(),
  location: Joi.string().max(200),
  description: Joi.string().max(2000).allow(''),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/),
  email: Joi.string().email(),
  sections: Joi.array(),
  branding: Joi.object(),
  domain: Joi.string(),
  theme: Joi.string(),
}).min(1);

const updateSectionSchema = Joi.object({
  sectionId: Joi.string().required(),
  data: Joi.object().required(),
});

const reorderSectionsSchema = Joi.object({
  sectionIds: Joi.array().items(Joi.string()).required(),
});

export const validateCreateWebsite = [Validator.validate({ body: createWebsiteSchema })];
export const validateGenerateComplete = [Validator.validate({ body: generateCompleteSchema })];
export const validateUpdateWebsite = [Validator.validate({ body: updateWebsiteSchema })];
export const validateUpdateSection = [Validator.validate({ body: updateSectionSchema })];
export const validateReorderSections = [Validator.validate({ body: reorderSectionsSchema })];
