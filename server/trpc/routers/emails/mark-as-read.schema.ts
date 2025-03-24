import type { InferOutput} from "valibot";
import { object, string } from "valibot";

export const ZMarkAsReadInputSchema = object({
  id: string(),
});

export type TMarkAsReadInput = InferOutput<typeof ZMarkAsReadInputSchema>;
