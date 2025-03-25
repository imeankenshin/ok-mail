import { procedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authedProcedure = procedure.use(
  (ctx) => {
    if (!ctx.ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No session",
      });
    }
    return ctx.next({
      ctx: {
        ...ctx.ctx,
        session: ctx.ctx.session,
      },
    });
  }
);
