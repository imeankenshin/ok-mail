import type { InferOutput } from "valibot";
import { object, string, nullish } from "valibot";

export const ZListDraftsInput = object({
  pageToken: nullish(string()),
});

export type TListDraftsInput = InferOutput<typeof ZListDraftsInput>;
