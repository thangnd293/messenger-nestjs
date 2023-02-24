export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationType = keyof typeof ConversationEnum;
export enum ConversationEnum {
  private = 'private',
  group = 'group',
}

export type MessageType = keyof typeof MessageStatusEnum;
export enum MessageTypeEnum {
  text = 'text',
  image = 'image',
  video = 'video',
  audio = 'audio',
  file = 'file',
}

export type MessageStatus = keyof typeof MessageStatusEnum;
export enum MessageStatusEnum {
  sent = 'sent',
  seen = 'seen',
  received = 'received',
}
