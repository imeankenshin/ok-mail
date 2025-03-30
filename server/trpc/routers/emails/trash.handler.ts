import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { TTrashEmailInput } from "./trash.schema";
import type { OAuth2Client } from "google-auth-library";
import { TRPCError } from "@trpc/server";

export const trashEmailHandler = async ({
  input,
  ctx,
}: {
  input: TTrashEmailInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({
    version: "v1",
    auth: ctx.oauth2Client,
  });

  const { error } = await tryCatch(
    gmail.users.messages.trash({
      userId: "me",
      id: input.id,
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to trash email",
      cause: error,
    });
  }

  return { success: true };
};
