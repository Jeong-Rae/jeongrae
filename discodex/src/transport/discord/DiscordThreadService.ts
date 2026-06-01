export type CreatePrivateThreadInput = {
  parentChannelId: string;
  name: string;
};

export type CreatePrivateThreadOutput = {
  threadId: string;
};

export type DiscordThreadService = {
  createPrivateThread(input: CreatePrivateThreadInput): Promise<CreatePrivateThreadOutput>;
  deleteThread?(threadId: string): Promise<void>;
};
