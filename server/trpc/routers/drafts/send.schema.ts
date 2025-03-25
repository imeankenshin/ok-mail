import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VSendDraftInputSchema = object({
  draftId: string(),
});

export type TSendDraftInput = InferOutput<typeof VSendDraftInputSchema>;
