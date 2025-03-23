/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = () => ({});

export type Context = Awaited<ReturnType<typeof createContext>>;
