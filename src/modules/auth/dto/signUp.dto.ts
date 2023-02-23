import * as Joi from 'joi';

export class SignUpDto {
  username: string;
  password: string;
  lastName: string;
  firstName: string;
  birthDate: Date;
}

export const SignUpDtoSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  lastName: Joi.string().required(),
  firstName: Joi.string().required(),
  birthDate: Joi.date().required(),
});
