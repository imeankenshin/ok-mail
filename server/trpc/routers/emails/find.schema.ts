import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VFindEmailInputSchema = object({
  id: string(),
});

export type TFindEmailInput = InferOutput<typeof VFindEmailInputSchema>;
