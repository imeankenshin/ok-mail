import type { OAuth2Client } from "google-auth-library";
import type { TUpdateDraftInput } from "./update.schema";
import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";

export const updateDraftHandler = async ({
  input,
  ctx,
}: {
  input: TUpdateDraftInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  const { data: draft, error } = await tryCatch(
    gmail.users.drafts.update({
      userId: "me",
      id: input.draftId,
      requestBody: {
        message: {
          raw: encodeMIMEMessage({
            to: input.to,
            subject: input.subject,
            body: input.body,
          }),
        },
      },
    })
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update draft",
      cause: error,
    });
  }

  return { draftId: draft.data.id! };
};
