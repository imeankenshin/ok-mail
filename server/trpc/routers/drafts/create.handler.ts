import { google } from "googleapis";
import { tryCatch } from "#shared/utils/try-catch";
import type { OAuth2Client } from "google-auth-library";
import { TRPCError } from "@trpc/server";
import type { TCreateDraftInput } from "./create.schema";

export const createDraftHandler = async ({
  input,
  ctx,
}: {
  input: TCreateDraftInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  const { data: draft, error } = await tryCatch(
    gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodeMIMEMessage({
            to: input.to,
            subject: input.subject,
            body: input.body,
          }),
        },
      },
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create draft",
      cause: error,
    });
  }

  return { draftId: draft.data.id! };
};
