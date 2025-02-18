import { google } from "googleapis";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const emailId = event.context.params?.id;
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

  await gmail.users.messages.trash({
    userId: "me",
    id: emailId,
  });

  return { success: true };
});
