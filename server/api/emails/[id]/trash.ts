import { google } from "googleapis";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import { tryCatch } from "~/shared/utils/error";

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

  const [_, error] = await tryCatch(() =>
    gmail.users.messages.trash({
      userId: "me",
      id: emailId,
    })
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to trash email",
    });
  }

  return { success: true };
});
