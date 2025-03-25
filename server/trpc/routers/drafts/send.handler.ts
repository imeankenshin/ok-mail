import { TRPCError } from "@trpc/server";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { TSendDraftInput } from "./send.schema";

export const sendDraftHandler = async ({
  input,
  ctx,
}: {
  input: TSendDraftInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  const { data: draft, error } = await tryCatch(
    gmail.users.drafts.send({
      userId: "me",
      requestBody: {
        id: input.draftId,
      },
    })
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send draft",
      cause: error,
    });
  }

  return { draftId: draft.data.id! };
};
