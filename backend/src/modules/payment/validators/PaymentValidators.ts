import Joi from 'joi';
import { Validator } from '../../../core/security/Validator';

const createSubscriptionSchema = Joi.object({
  plan: Joi.string().valid('starter', 'professional', 'business', 'enterprise').required(),
  interval: Joi.string().valid('monthly', 'yearly').required(),
  provider: Joi.string().valid('stripe', 'razorpay').required(),
});

export const validateCreateSubscription = [Validator.validate({ body: createSubscriptionSchema })];
