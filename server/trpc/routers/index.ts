import { nullish, object, string } from 'valibot'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import { google } from 'googleapis'
import { tryCatch } from '~/shared/utils/try-catch'
import type { Email } from '~/shared/types/email'

export const appRouter = router({
  hello: publicProcedure
    .input(
      object({
        text: nullish(string()),
      }),
    )
    .query(({ input }) => ({
      greeting: `hello ${input?.text ?? 'world'}`,
    })),
    getEmailList: protectedProcedure
      .input(
        object({
          q: nullish(string()),
          pageToken: nullish(string()),
        }),
      )
      .query(async ({ input, ctx }) => {
        const limit = 10; // Number of emails per page

        const gmail = google.gmail({
          version: "v1",
          auth: ctx.oauth2Client,
        });
        const { data: messageList, error } = await tryCatch(
          gmail.users.messages.list({
            userId: "me",
            maxResults: limit,
            pageToken: input.pageToken as string,
            q: input.q || "-in:drafts",
          })
        );

        if (error) {
          throw new Error("Failed to fetch emails");
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
      })
})

// export type definition of API
export type AppRouter = typeof appRouter
