import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const VTrashEmailInputSchema = object({
  id: string(),
});

export type TTrashEmailInput = InferOutput<typeof VTrashEmailInputSchema>;
