import type { InferOutput } from "valibot";
import { object, string } from "valibot";

export const ZTrashEmailInputSchema = object({
  id: string(),
});

export type TTrashEmailInput = InferOutput<typeof ZTrashEmailInputSchema>;
