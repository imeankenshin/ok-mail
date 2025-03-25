import type { InferOutput } from "valibot";
import { object, array, string, pipe, email, nullish } from "valibot";

export const VCreateDraftInputSchema = object({
  to: array(pipe(string(), email())),
  subject: nullish(string(), ""),
  body: nullish(string(), "")
});

export type TCreateDraftInput = InferOutput<typeof VCreateDraftInputSchema>;
