import * as Joi from 'joi';

export class CreatePrivateConversationDto {
  recipient: string;
}

export const CreatePrivateConversationDtoSchema = Joi.object({
  recipient: Joi.string().required(),
});
