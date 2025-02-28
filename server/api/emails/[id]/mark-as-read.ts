// メールを既読にする

import { google } from "googleapis";
import { tryCatch } from "#shared/utils/error";

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
  const [_, error] = await tryCatch(() =>
    gmail.users.messages.modify({
      userId: "me",
      id: emailId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    })
  );

  if (error) {
    console.error("Error marking email as read:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to mark email as read",
    });
  }
  return { success: true };
});
