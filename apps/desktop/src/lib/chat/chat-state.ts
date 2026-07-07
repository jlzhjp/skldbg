import { Schema } from "effect";
import { match } from "ts-pattern";

/**
 * Schema for an SSE message chunk.
 * We parse these from the stream data.
 */
export const MessageChunkSchema = Schema.Struct({
  role: Schema.String,
  content: Schema.String,
  id: Schema.optional(Schema.NullishOr(Schema.String)),
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
});

export type MessageChunk = Schema.Schema.Type<typeof MessageChunkSchema>;

/**
 * Overall state of the current chat interaction.
 */
export type ChatStatus =
  | { readonly _tag: "Idle" }
  | { readonly _tag: "LoadingHistory" }
  | { readonly _tag: "Sending"; readonly userContent: string }
  | {
      readonly _tag: "Streaming";
      readonly userContent: string;
      readonly streamedMessages: ReadonlyArray<MessageChunk>;
    }
  | { readonly _tag: "Error"; readonly error: string };

const mergeChunk = (
  messages: ReadonlyArray<MessageChunk>,
  chunk: MessageChunk,
): ReadonlyArray<MessageChunk> => {
  const lastMessage = messages.at(-1);
  if (
    lastMessage &&
    lastMessage.role === chunk.role &&
    lastMessage.id === chunk.id &&
    chunk.role === "assistant"
  ) {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: lastMessage.content + chunk.content,
        metadata: { ...lastMessage.metadata, ...chunk.metadata },
      },
    ];
  }

  return [...messages, chunk];
};

/**
 * Functional updates for ChatStatus using ts-pattern.
 */
export const updateChatStatus = (
  current: ChatStatus,
  action:
    | { _tag: "StartSend"; content: string }
    | { _tag: "ReceiveChunk"; chunk: MessageChunk }
    | { _tag: "FinishStream" }
    | { _tag: "SetError"; error: string }
    | { _tag: "Reset" },
): ChatStatus =>
  match(action)
    .with({ _tag: "StartSend" }, ({ content }) => ({
      _tag: "Sending" as const,
      userContent: content,
    }))
    .with({ _tag: "ReceiveChunk" }, ({ chunk }) => {
      return {
        _tag: "Streaming" as const,
        userContent: match(current)
          .with({ _tag: "Sending" }, ({ userContent }) => userContent)
          .with({ _tag: "Streaming" }, ({ userContent }) => userContent)
          .otherwise(() => ""),
        streamedMessages: mergeChunk(
          match(current)
            .with({ _tag: "Streaming" }, ({ streamedMessages }) => streamedMessages)
            .otherwise(() => [] as MessageChunk[]),
          chunk,
        ),
      };
    })
    .with({ _tag: "FinishStream" }, () => ({ _tag: "Idle" as const }))
    .with({ _tag: "SetError" }, ({ error }) => ({
      _tag: "Error" as const,
      error,
    }))
    .with({ _tag: "Reset" }, () => ({ _tag: "Idle" as const }))
    .exhaustive();
