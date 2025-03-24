import { TRPCError } from "@trpc/server";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { TDeleteDraftInput } from "./delete.schema";

export const deleteDraftHandler = async ({
  input,
  ctx,
}: {
  input: TDeleteDraftInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  const { error } = await tryCatch(
    gmail.users.drafts.delete({
      userId: "me",
      id: input.draftId,
    })
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete draft",
      cause: error,
    });
  }

  return { success: true };
};
