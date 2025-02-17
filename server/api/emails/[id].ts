import { google } from "googleapis";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "無効なメールIDです",
    });
  }

  try {
    const gmail = google.gmail({
      version: "v1",
      auth: event.context.oAuth2Client,
    });
    const response = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
      // 必要なフィールドのみを指定
      fields: "payload(headers,body,parts(mimeType,body))",
    });

    const message = response.data;
    const headers = message?.payload?.headers;

    const email = {
      subject:
        headers?.find((h) => h.name === "Subject")?.value || "(件名なし)",
      from: headers?.find((h) => h.name === "From")?.value || "",
      to: headers?.find((h) => h.name === "To")?.value || "",
      date: headers?.find((h) => h.name === "Date")?.value || "",
      body: "",
      isHtml: false,
    };

    // メール本文の取得
    if (message?.payload?.parts) {
      // HTMLとプレーンテキストの両方を探す
      const parts = message.payload.parts.filter(
        (part) => part.mimeType === "text/html" || part.mimeType === "text/plain"
      );

      // パートをMIMEタイプでソート（HTMLを優先）
      parts.sort((a, b) => {
        if (a.mimeType === "text/html") return -1;
        if (b.mimeType === "text/html") return 1;
        return 0;
      });

      if (parts.length > 0 && parts[0].body?.data) {
        const content = Buffer.from(parts[0].body.data, "base64").toString();
        email.body = content;
        email.isHtml = parts[0].mimeType === "text/html";
      }
    } else if (message?.payload?.body?.data) {
      const content = Buffer.from(
        message.payload.body.data,
        "base64"
      ).toString();

      const isHtml = message.payload.mimeType?.includes("html");
      email.body = content;
      email.isHtml = !!isHtml;
    }

    // メールヘッダーからContent-Typeを取得して確認
    const contentType = headers?.find((h) => h.name === "Content-Type")?.value || "";
    if (!email.isHtml && contentType.includes("text/html")) {
      email.isHtml = true;
    }

    return email;
  } catch (error) {
    console.error("Error fetching email:", error);
    throw createError({
      statusCode: 500,
      message: "メールの取得に失敗しました",
    });
  }
});
