import { google } from "googleapis";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import { tryCatch } from "~/shared/utils/try-catch";

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

  const { error } = await tryCatch(
    gmail.users.drafts.delete({
      userId: "me",
      id: emailId,
    })
  );

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to trash email",
      cause: error,
    });
  }

  return { success: true };
});
