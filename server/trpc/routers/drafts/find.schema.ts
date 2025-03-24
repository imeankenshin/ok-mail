import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const ZFindDraftInput = object({
  draftId: string(),
});

export type TFindDraftInput = InferOutput<typeof ZFindDraftInput>;
