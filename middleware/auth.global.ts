import { navigateTo } from "#imports";
import { useSession } from "@/lib/auth-client";

export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.server) return
  const { data: session } = await useSession(useFetch);

  // Protected routes
  if (!session.value) {
    return navigateTo("/welcome");
  }

  return;
});
