import { google } from "googleapis";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = 10; // Number of emails per page

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: limit,
    pageToken: query.pageToken as string,
  });

  const messages = response.data.messages || [];
  const emails = (
    await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id as string,
        });

        if (!email.data.id) {
          return null;
        }

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
    )
  ).filter((email) => email !== null);

  const nextPageToken = response.data.nextPageToken;
  const hasNextPage = nextPageToken !== undefined;

  return {
    emails,
    hasNextPage,
    nextPageToken,
  };
});
