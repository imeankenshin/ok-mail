import { nullish, object, string } from 'valibot'
import { publicProcedure, router } from '../trpc'

export const appRouter = router({
  hello: publicProcedure
    .input(
      object({
        text: nullish(string()),
      }),
    )
    .query(({ input }) => ({
      greeting: `hello ${input?.text ?? 'world'}`,
    })),
})

// export type definition of API
export type AppRouter = typeof appRouter
