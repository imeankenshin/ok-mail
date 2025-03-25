import type { InferOutput } from "valibot";
import { object, array, string, pipe, email, optional } from "valibot";

export const VCreateDraftInputSchema = object({
  to: array(pipe(string(), email())),
  subject: optional(string(), ""),
  body: optional(string(), "")
});

export type TCreateDraftInput = InferOutput<typeof VCreateDraftInputSchema>;
