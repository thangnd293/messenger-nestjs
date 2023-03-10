import * as Joi from 'joi';

export class SignUpDto {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  birthDate: Date;
  avatar?: string;
}

export const SignUpDtoSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  birthDate: Joi.date().required(),
  avatar: Joi.string(),
});
