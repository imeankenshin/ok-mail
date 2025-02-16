import { google } from "googleapis";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";

export default defineVerifiedOnlyEventHandler(async (event) => {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: event.context.oAuth2Client,
    });
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id as string,
        });

        const headers = email.data.payload?.headers;
        const subject = headers?.find((h) => h.name === "Subject")?.value;
        const from = headers?.find((h) => h.name === "From")?.value;

        return {
          id: email.data.id,
          subject: subject || "(件名なし)",
          from: from || "不明",
          snippet: email.data.snippet,
        };
      })
    );

    return { emails };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return { error: "Failed to fetch emails" };
  }
});
