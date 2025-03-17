import { google } from "googleapis";
import type { EventHandlerRequest } from "h3";
import type { Email, EmailListResponse } from "#shared/types/email";
import { tryCatch } from "~/shared/utils/error";
import { optional, pipe, string, safeParse } from "valibot";

const querySchema = optional(pipe(string()))

export default defineVerifiedOnlyEventHandler<
  EventHandlerRequest,
  EmailListResponse
>(async (event) => {
  const query = getQuery(event);
  const { success, output: q } = safeParse(querySchema, query.q);
  if (!success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameter",
    });
  }
  const limit = 10; // Number of emails per page

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });
  const [messageList, error] = await tryCatch(() =>
    gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      pageToken: query.pageToken as string,
      q: q || "-in:drafts",
    })
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch emails",
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

  const response: EmailListResponse = {
    emails,
    nextPageToken,
  };

  return response;
});
