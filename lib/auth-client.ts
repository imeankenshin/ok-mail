import { createAuthClient } from "better-auth/vue";

export const { signIn, signOut, useSession, $fetch } = createAuthClient({
  fetchOptions: {
    onError: ({ error }) => {
      if (error.status === 401) {
        signOut();
        return;
      }
      throw showError(error);
    },
  },
});
