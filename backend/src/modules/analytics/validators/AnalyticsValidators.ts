import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const trackSchema = Joi.object({
  websiteId: Joi.string().required(),
  visitorId: Joi.string().required(),
  page: Joi.string().required(),
  referrer: Joi.string().optional().allow(''),
  device: Joi.string().optional().default('desktop'),
  browser: Joi.string().optional().default('unknown'),
  os: Joi.string().optional().default('unknown'),
  country: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  sessionId: Joi.string().required(),
  duration: Joi.number().optional().default(0),
  bounce: Joi.boolean().optional().default(false),
});

const websiteStatsSchema = Joi.object({
  websiteId: Joi.string().required(),
});

export const validateTrack = [Validator.validate({ body: trackSchema })];
export const validateWebsiteStats = [Validator.validate({ params: websiteStatsSchema })];
