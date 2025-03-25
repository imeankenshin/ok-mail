import type { InferOutput} from "valibot";
import { object, string } from "valibot";

export const VMarkAsReadInputSchema = object({
  id: string(),
});

export type TMarkAsReadInput = InferOutput<typeof VMarkAsReadInputSchema>;
