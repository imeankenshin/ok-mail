import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VDeleteDraftInputSchema = object({
  draftId: string(),
});

export type TDeleteDraftInput = InferOutput<typeof VDeleteDraftInputSchema>;
