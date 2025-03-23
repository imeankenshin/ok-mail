import type { AppRouter } from "~/server/trpc/routers";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const useServerClient = () => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        async fetch(input, init) {
          // Create a standard fetch request that can be properly cloned
          let url: string;
          let options: RequestInit;

          if (typeof input === "string") {
            url = input;
            options = init || {};
          } else if (input instanceof Request) {
            url = input.url;
            options = {
              ...init,
              method: input.method,
              headers: input.headers,
              body: input.body,
            };
          } else {
            // Handle URL object
            url = input.toString();
            options = init || {};
          }

          // Use the appropriate fetch method based on environment
          const response = await fetch(url, options);

          // Return a clone of the response to avoid body consumption issues
          return response.clone();
        },
      }),
    ],
  });
};
