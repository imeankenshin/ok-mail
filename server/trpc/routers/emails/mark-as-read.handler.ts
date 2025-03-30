import { tryCatch } from "~/shared/utils/try-catch";

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { TRPCError } from "@trpc/server";
import type { TMarkAsReadInput } from "./mark-as-read.schema";

export const markAsReadHandler = async ({
  input,
  ctx,
}: {
  input: TMarkAsReadInput;
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
        removeLabelIds: ["UNREAD"],
      },
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to mark email as read",
      cause: error,
    });
  }
};
