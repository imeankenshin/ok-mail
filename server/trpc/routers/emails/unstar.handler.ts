import { google } from "googleapis";
import { tryCatch } from "#shared/utils/try-catch";
import { TRPCError } from "@trpc/server";
import type { OAuth2Client } from "google-auth-library";
import type { TUnstarInput } from "./unstar.schema";

export const unstarHandler = async ({
  input,
  ctx,
}: {
  input: TUnstarInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({
    version: "v1",
    auth: ctx.oauth2Client,
  });
  const { error } = await tryCatch(
    gmail.users.messages.modify({
      userId: "me",
      id: input.id,
      requestBody: {
        removeLabelIds: ["STARRED"],
      },
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to unmark email as starred",
      cause: error,
    });
  }
};
