import type { InferOutput } from "valibot";
import { optional, object, string } from "valibot";

export const VListEmailsInputSchema = object({
  q: optional(string(), "-in:drafts"),
  pageToken: optional(string()),
});

export type TListEmailsInput = InferOutput<typeof VListEmailsInputSchema>;
