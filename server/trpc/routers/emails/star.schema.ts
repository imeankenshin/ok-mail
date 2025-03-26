import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VStarInputSchema = object({
  id: string(),
});

export type TStarInput = InferOutput<typeof VStarInputSchema>;
