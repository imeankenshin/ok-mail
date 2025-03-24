import type { InferOutput } from "valibot";
import { array, minLength, object, pipe, string } from "valibot";

export const ZSendEmailInputSchema = object({
  to: array(string()),
  subject: pipe(string(), minLength(1)),
  body: pipe(string(), minLength(1)),
});

export type TSendEmailInput = InferOutput<typeof ZSendEmailInputSchema>;
