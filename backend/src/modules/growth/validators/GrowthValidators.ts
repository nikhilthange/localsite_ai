import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const generateReportSchema = Joi.object({
  websiteId: Joi.string().required(),
});

const markReadSchema = Joi.object({
  insightId: Joi.string().required(),
});

const dismissSchema = Joi.object({
  insightId: Joi.string().required(),
});

export const validateGenerateReport = [Validator.validate({ params: generateReportSchema })];
export const validateMarkRead = [Validator.validate({ params: markReadSchema })];
export const validateDismiss = [Validator.validate({ params: dismissSchema })];
