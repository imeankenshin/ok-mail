import { object, string } from "valibot";
import type { InferOutput } from "valibot";

export const VUnstarInputSchema = object({
  id: string(),
});

export type TUnstarInput = InferOutput<typeof VUnstarInputSchema>;
