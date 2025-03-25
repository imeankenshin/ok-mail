import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import type { Email } from "#shared/types/email";
import { tryCatch } from "#shared/utils/try-catch";
import type { OAuth2Client } from "google-auth-library";
import type { TListEmailsInput } from "./list.schema";

const LIMIT = 10; // Number of emails per page

export const listEmailsHandler = async ({
  input,
  ctx,
}: {
  input: TListEmailsInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({
    version: "v1",
    auth: ctx.oauth2Client,
  });
  const { data: messageList, error } = await tryCatch(
    gmail.users.messages.list({
      userId: "me",
      maxResults: LIMIT,
      pageToken: input.pageToken,
      q: input.q,
    })
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch emails",
      cause: error,
    });
  }

  const messages = messageList.data.messages || [];
  const emails = (
    await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id as string,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        if (!email.data.id) {
          return null;
        }

        const headers = email.data.payload?.headers;
        const subject = headers?.find((h) => h.name === "Subject")?.value;
        const from = headers?.find((h) => h.name === "From")?.value;
        const date = headers?.find((h) => h.name === "Date")?.value;
        const isRead = !email.data.labelIds?.includes("UNREAD");

        const emailData: Email = {
          id: email.data.id,
          threadId: email.data.threadId || "",
          subject: subject || "(件名なし)",
          from: from || "不明",
          snippet: email.data.snippet || "",
          date: date || "",
          isRead,
        };

        return emailData;
      })
    )
  ).filter((email): email is Email => email !== null);

  const nextPageToken = messageList.data.nextPageToken || undefined;

  const response = {
    emails,
    nextPageToken,
  };

  return response;
};
