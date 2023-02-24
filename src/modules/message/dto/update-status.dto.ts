import * as Joi from 'joi';
import { MessageStatusEnum } from 'types/common';

export class UpdateStatusDto {
  messageId: string;
  status: MessageStatusEnum;
}

export const UpdateStatusDtoSchema = Joi.object({
  messageId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(MessageStatusEnum))
    .required(),
});
