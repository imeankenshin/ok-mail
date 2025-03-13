import { navigateTo } from "#imports";
import { useSession } from "@/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.server) return;
  const { data: session } = await useSession(useFetch);

  if (to.path === "/welcome" || session.value) {
    return;
  }

  return navigateTo("/welcome");
});
