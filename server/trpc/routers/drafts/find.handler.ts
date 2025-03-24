import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { EmailDraft } from "#shared/types/email";
import type { OAuth2Client } from "google-auth-library";
import type { TFindDraftInput } from "./find.schema";
import { TRPCError } from "@trpc/server";

export const findDraftHandler = async ({
  input,
  ctx,
}: {
  input: TFindDraftInput;
  ctx: { oauth2Client: OAuth2Client };
}) => {
  const gmail = google.gmail({ version: "v1", auth: ctx.oauth2Client });

  const { error, data: draft } = await tryCatch(
    gmail.users.drafts
      .get({
        userId: "me",
        id: input.draftId,
        format: "full",
      })
      .then((res) => res.data)
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to find draft",
      cause: error,
    });
  }

  const message = draft.message;

  if (!message || !message.payload) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Draft not found",
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
  } satisfies EmailDraft;
};
