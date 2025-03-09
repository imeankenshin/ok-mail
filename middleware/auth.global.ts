import { navigateTo } from "#imports";
import { useSession } from "@/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.server) return
  const { data: session } = await useSession(useFetch);

  // Public routes that don't require authentication
  if (to.path === "/welcome") {
    if (session.value) {
      return navigateTo("/");
    }
    return;
  }

  // Protected routes
  if (!session.value) {
    return navigateTo("/welcome");
  }

  return;
});
