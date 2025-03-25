import type { InferOutput } from "valibot";
import { object, array, string, pipe, email, optional } from "valibot";

export const VUpdateDraftInputSchema = object({
  draftId: string(),
  to: array(pipe(string(), email())),
  subject: optional(string(), ""),
  body: optional(string(), ""),
});

export type TUpdateDraftInput = InferOutput<typeof VUpdateDraftInputSchema>;
