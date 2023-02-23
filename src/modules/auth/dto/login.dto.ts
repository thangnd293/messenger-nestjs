import * as Joi from 'joi';

export class LoginDto {
  username: string;
  password: string;
}

export const LoginDtoSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
