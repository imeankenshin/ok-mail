import type { InferOutput } from "valibot";
import { nullish, object, string } from "valibot";

export const VListEmailsInputSchema = object({
  q: nullish(string()),
  pageToken: nullish(string()),
});

export type TListEmailsInput = InferOutput<typeof VListEmailsInputSchema>;
