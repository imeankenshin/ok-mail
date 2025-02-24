// メールを既読にする

import { google } from "googleapis";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const emailId = getRouterParam(event, "id");
  if (!emailId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email ID",
    });
  }

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });
  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: emailId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking email as read:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark email as read",
    });
  }
});
