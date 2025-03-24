import type { InferOutput } from "valibot";
import { nullish, object, string } from "valibot";

export const ZGetEmailInputSchema = object({
  q: nullish(string()),
  pageToken: nullish(string()),
});

export type TGetEmailInput = InferOutput<typeof ZGetEmailInputSchema>;
