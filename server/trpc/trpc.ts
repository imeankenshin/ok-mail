/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "~/server/trpc/context";
const t = initTRPC.context<Context>().create();

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(
  t.middleware((ctx) => {
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
  })
);
export const router = t.router;
export const middleware = t.middleware;
