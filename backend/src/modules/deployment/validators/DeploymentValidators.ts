import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const deploySchema = Joi.object({
  websiteId: Joi.string().required(),
});

const setupDomainSchema = Joi.object({
  deploymentId: Joi.string().required(),
  domain: Joi.string().domain().required(),
});

const checkSslSchema = Joi.object({
  deploymentId: Joi.string().required(),
});

export const validateDeploy = [Validator.validate({ params: deploySchema })];
export const validateSetupDomain = [Validator.validate({ body: setupDomainSchema })];
export const validateCheckSsl = [Validator.validate({ params: checkSslSchema })];
