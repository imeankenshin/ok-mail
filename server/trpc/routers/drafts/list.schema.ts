import type { InferOutput } from "valibot";
import { optional, object, string } from "valibot";

export const VListDraftsInputSchema = object({
  pageToken: optional(string()),
});

export type TListDraftsInput = InferOutput<typeof VListDraftsInputSchema>;
