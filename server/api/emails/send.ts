import { google } from "googleapis";
import { readBody } from "h3";
import { tryCatch } from "#shared/utils/error";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import { object, string, pipe, email, minLength, safeParse} from "valibot";

const sendEmailRequestSchema = object({
  to: pipe(string(), email()),
  subject: pipe(string(), minLength(1)),
  body: pipe(string(), minLength(1)),
});

export default defineVerifiedOnlyEventHandler(async (event) => {
  const body = safeParse(sendEmailRequestSchema, await readBody(event));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid body",
      data: body.issues,
    });
  }

  const gmail = google.gmail({ version: "v1", auth: event.context.oAuth2Client });
  const utf8Subject = `=?utf-8?B?${Buffer.from(body.output.subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${body.output.to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    body.output.body,
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
    throw createError(sendEmailError);
  }

  return { success: true, messageId: res.data.id };
});
