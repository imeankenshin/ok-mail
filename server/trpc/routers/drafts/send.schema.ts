import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const ZSendDraftInput = object({
  draftId: string(),
});

export type TSendDraftInput = InferOutput<typeof ZSendDraftInput>;
