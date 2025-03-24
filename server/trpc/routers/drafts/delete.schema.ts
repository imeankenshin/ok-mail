import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const ZDeleteDraftInput = object({
  draftId: string(),
});

export type TDeleteDraftInput = InferOutput<typeof ZDeleteDraftInput>;
