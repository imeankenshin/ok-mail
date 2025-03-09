import { navigateTo } from "#imports";
import { useSession } from "@/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await useSession(useFetch);

  if (!session.value) {
    if (to.path !== "/welcome") {
      return navigateTo("/welcome");
    }
  }

  return;
});
