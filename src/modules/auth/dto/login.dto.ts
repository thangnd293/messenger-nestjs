import * as Joi from 'joi';

export class LoginDto {
  email: string;
  password: string;
}

export const LoginDtoSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
