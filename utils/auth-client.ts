import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: process.env.NUXT_PUBLIC_BETTER_AUTH_URL,
});
