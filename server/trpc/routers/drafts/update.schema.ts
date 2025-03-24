import type { InferOutput } from "valibot";
import { object, array, string, pipe, email, nullish } from "valibot";

export const ZUpdateDraftInput = object({
  draftId: string(),
  to: array(pipe(string(), email())),
  subject: nullish(string(), ""),
  body: nullish(string(), ""),
});

export type TUpdateDraftInput = InferOutput<typeof ZUpdateDraftInput>;
