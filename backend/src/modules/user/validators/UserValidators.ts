import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  avatar: Joi.string().uri().optional().allow(''),
  phone: Joi.string().pattern(/^\+?[\d\s-]{10,15}$/).optional().allow(''),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
});

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark'),
  notifications: Joi.boolean(),
  emailReports: Joi.boolean(),
});

export const validateUpdateProfile = [Validator.validate({ body: updateProfileSchema })];
export const validateUpdatePassword = [Validator.validate({ body: updatePasswordSchema })];
export const validateUpdatePreferences = [Validator.validate({ body: updatePreferencesSchema })];
