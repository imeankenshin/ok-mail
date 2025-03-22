import { google } from "googleapis";
import { readBody } from "h3";
import { tryCatch } from "~/shared/utils/try-catch";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import { object, string, pipe, minLength, safeParse, array} from "valibot";

const sendEmailRequestSchema = object({
  to: array(string()),
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

  // MIMEメッセージの作成
  const encodedMessage = encodeMIMEMessage({
    to: body.output.to,
    subject: body.output.subject,
    body: body.output.body
  });

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
