export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationType = keyof typeof ConversationEnum;
export enum ConversationEnum {
  private = 'private',
  group = 'group',
}
