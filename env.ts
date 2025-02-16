import { createEnv } from "@t3-oss/env-nuxt";
import { string, url, pipe } from "valibot";

export const env = createEnv({
  server: {
    GOOGLE_CLIENT_SECRET: string(),
    GOOGLE_CLIENT_ID: string(),
    GOOGLE_REDIRECT_URI: pipe(string(), url()),
    BETTER_AUTH_SECRET: string(),
  },
  client: {
    NUXT_PUBLIC_BETTER_AUTH_URL: pipe(string(), url()),
  },
});
