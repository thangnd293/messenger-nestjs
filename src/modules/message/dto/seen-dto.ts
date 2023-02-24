import * as Joi from 'joi';

export class SeenDto {
  messageId: string;
}

export const SeenDtoSchema = Joi.object({
  messageId: Joi.string().required(),
});
