import { google } from "googleapis";
import { defineEventHandler, readBody } from "h3";
import { tryCatch } from "#shared/utils/error";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default defineEventHandler(async (event) => {
  const [{ to, subject, body }, readBodyError] = await tryCatch(() => readBody(event));

  if (readBodyError) {
    throw createError({
      statusCode: 400,
      message: "Invalid body",
    });
  }

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    body,
  ];
  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const [res, sendEmailError] = await tryCatch(() =>
    gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    })
  );
  if (sendEmailError) {
    console.error("Error sending email:", sendEmailError);
    throw createError({
      statusCode: 500,
      message: "メールの送信に失敗しました",
    });
  }

  return { success: true, messageId: res.data.id };
});
