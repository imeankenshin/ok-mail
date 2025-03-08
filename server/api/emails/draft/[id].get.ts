import { google } from "googleapis";
import { tryCatch } from "#shared/utils/error";
import { defineVerifiedOnlyEventHandler } from "~/server/utils/handler";
import type { EmailDraft } from "#shared/types/email";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "無効な下書きIDです",
    });
  }

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });

  const [draft, error] = await tryCatch(() =>
    gmail.users.drafts
      .get({
        userId: "me",
        id,
        format: "full",
      })
      .then((res) => res.data)
  );

  if (error) {
    throw createError({
      statusCode: 500,
      message: "下書きの取得に失敗しました",
      cause: error,
    });
  }

  const message = draft.message;

  if (!message || !message.payload) {
    throw createError({
      statusCode: 500,
      message: "下書きのメッセージが見つかりませんでした",
    });
  }

  const headers = message.payload.headers || [];

  // 下書きからメール情報を抽出
  const toHeader = headers.find((h) => h.name === "To")?.value || "";
  // 複数の宛先がある場合はカンマで区切られているので配列に変換
  // "aaa" <aaa@example.com> -> aaa@example.com
  const to = toHeader.split(",").map((email) => email.trim().replace(/"(.*?)" <(.*?)>/, "$2"));
  const subject = headers.find((h) => h.name === "Subject")?.value || "";

  // 本文を取得
  let body = "";
  if (message.payload.parts) {
    // マルチパートの場合
    const textPart = message.payload.parts.find(
      (part) => part.mimeType === "text/plain"
    );
    if (textPart && textPart.body && textPart.body.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  } else if (message.payload.body && message.payload.body.data) {
    // シングルパートの場合
    body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
  }

  return {
    to,
    subject,
    body,
    draftId: id,
  } satisfies EmailDraft;
});
