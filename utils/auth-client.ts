import { createAuthClient } from "better-auth/vue";
export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: "http://localhost:3000",
  fetchOptions: {
    onError: ({error}) => {
      if (error.status === 401) {
        signOut();
        return
      }
      throw showError(error);
    },
  }
});
