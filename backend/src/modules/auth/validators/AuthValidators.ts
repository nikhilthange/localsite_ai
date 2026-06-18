import { Validator, schemas } from '../../../core/security/Validator';

export const registerValidator = [Validator.validate({ body: schemas.auth.register })];
export const loginValidator = [Validator.validate({ body: schemas.auth.login })];
export const forgotValidator = [Validator.validate({ body: schemas.auth.forgotPassword })];
export const resetValidator = [Validator.validate({ body: schemas.auth.resetPassword })];
