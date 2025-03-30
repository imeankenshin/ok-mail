import { navigateTo } from "#imports";
import { useSession } from "@/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.server) return;
  const { data: session, error } = await useSession(useFetch);

  if (error.value) {
    throw showError({
      statusCode: 500,
      message: "認証情報の取得に失敗しました",
      cause: error.value,
    });
  }

  if (to.path === "/welcome" || session.value) {
    return;
  }

  return navigateTo("/welcome");
});
