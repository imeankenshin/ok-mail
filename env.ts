import { createEnv } from "@t3-oss/env-nuxt";
import { string, pipe, url, minLength } from "valibot";

export const env = createEnv({
  server: {
    GOOGLE_CLIENT_ID: pipe(string(), minLength(1)),
    GOOGLE_CLIENT_SECRET: pipe(string(), minLength(1)),
    GOOGLE_REDIRECT_URI: pipe(string(), minLength(1), url()),
    GOOGLE_API_KEY: pipe(string(), minLength(1)),
    BETTER_AUTH_SECRET: pipe(string(), minLength(1)),
  },
});
