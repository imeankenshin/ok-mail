import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { OAuth2Client } from "google-auth-library";
import { TRPCError } from "@trpc/server";
import type { TSendEmailInput } from "./send.schema";

export const sendEmailHandler = async ({
  input,
  ctx,
}: {
  input: TSendEmailInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  // MIMEメッセージの作成
  const encodedMessage = encodeMIMEMessage({
    to: input.to,
    subject: input.subject,
    body: input.body,
  });

  const { data: message, error: sendEmailError } = await tryCatch(
    gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    }),
  );
  if (sendEmailError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send email",
      cause: sendEmailError,
    });
  }
  return { message };
};
