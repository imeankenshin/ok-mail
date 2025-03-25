import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VFindDraftInputSchema = object({
  draftId: string(),
});

export type TFindDraftInput = InferOutput<typeof VFindDraftInputSchema>;
