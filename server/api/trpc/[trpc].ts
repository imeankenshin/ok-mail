import { createContext } from "~/server/trpc/context";
import { appRouter } from "~/server/trpc/routers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// export API handler
export default defineEventHandler(async (event) => {
  const { req } = event.node;
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
    req: new Request(getRequestURL(event), {
      method: req.method!,
      headers: new Headers(getHeaders(event) as Record<string, string>),
      body: isMethod(event, "GET") ? null : await readBody(event),
    }),
  });
});
