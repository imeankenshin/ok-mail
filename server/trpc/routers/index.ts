import { nullish, object, string } from "valibot";
import { router } from "../trpc";
import { publicProcedure } from "../procedures/public-procedure";
import { emailsRouter } from "./emails/_router";
import { draftRouter } from "./drafts/_router";

export const appRouter = router({
  hello: publicProcedure
    .input(
      object({
        text: nullish(string()),
      }),
    )
    .query(({ input }) => ({
      greeting: `hello ${input?.text ?? "world"}`,
    })),
  emails: emailsRouter,
  drafts: draftRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
