import { google } from "googleapis";
import { tryCatch } from "#shared/utils/try-catch";
import { TRPCError } from "@trpc/server";
import type { OAuth2Client } from "google-auth-library";
import type { TStarInput } from "./star.schema";

export const starHandler = async ({ input, ctx }: { input: TStarInput; ctx: { oauth2Client: OAuth2Client } }) => {
  const gmail = google.gmail({
    version: "v1",
    auth: ctx.oauth2Client,
  });
  const { error } = await tryCatch(
    gmail.users.messages.modify({
      userId: "me",
      id: input.id,
      requestBody: {
        addLabelIds: ["STARRED"],
      },
    })
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to mark email as starred",
      cause: error,
    });
  }
}
