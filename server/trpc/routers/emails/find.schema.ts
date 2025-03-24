import type { InferOutput} from "valibot";
import { object, string  } from "valibot";

export const ZFindEmailInputSchema = object({
  id: string(),
});

export type TFindEmailInput = InferOutput<typeof ZFindEmailInputSchema>;
