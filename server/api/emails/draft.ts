import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";
import { readBody } from "h3";
import { tryCatch, tryCatchCallback } from "#shared/utils/error";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import { object, string, safeParse, pipe, nullish, array } from "valibot";
import consola from "consola";

const saveDraftRequestSchema = object({
  to: array(pipe(string())),
  subject: nullish(string()),
  body: nullish(string()),
  draftId: nullish(string()),
});

export default defineVerifiedOnlyEventHandler(async (event) => {
  const body = safeParse(saveDraftRequestSchema, await readBody(event));

  if (!body.success) {
    consola.error(body.issues);
    throw createError({
      statusCode: 400,
      message: "Invalid body",
      data: body.issues,
    });
  }

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });

  // MIMEメッセージの作成
  const encodedMessage = encodeMIMEMessage({
    to: body.output.to,
    subject: body.output.subject || '',
    body: body.output.body || ''
  });

  // Create or update draft
  const requestBody: gmail_v1.Schema$Draft = {
    message: {
      raw: encodedMessage,
    },
  };

  const [res, error] = await tryCatch(async () => {
    const { draftId } = body.output;
    if (draftId) {
      // 下書きIDが指定されている場合、まず下書きが存在するか確認する
      const checkError = await tryCatchCallback(() =>
        gmail.users.drafts.get({
          userId: "me",
          id: draftId,
        })
      );

      if (checkError) {
        // 下書きが見つからない場合は新規作成する
        consola.warn(
          `Draft with ID ${body.output.draftId} not found, creating new draft instead`
        );
        return await gmail.users.drafts.create({
          userId: "me",
          requestBody,
        });
      } else {
        // 下書きが見つかった場合は更新する
        return await gmail.users.drafts.update({
          userId: "me",
          id: draftId,
          requestBody,
        });
      }
    } else {
      // 下書きIDが指定されていない場合は新規作成
      return await gmail.users.drafts.create({
        userId: "me",
        requestBody,
      });
    }
  });
  if (error) {
    throw createError(error);
  }

  return { success: true, draftId: res.data.id };
});
