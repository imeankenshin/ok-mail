import type { InferOutput } from "valibot";
import { nullish, object, string } from "valibot";

export const VListEmailsInputSchema = object({
  q: nullish(string(), "-in:drafts"),
  pageToken: nullish(string()),
});

export type TListEmailsInput = InferOutput<typeof VListEmailsInputSchema>;
