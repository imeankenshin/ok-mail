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
      const htmlPart = message.payload.parts.find(
        (part) => part.mimeType === "text/html"
      );
      const plainPart = message.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );

      if (htmlPart?.body?.data) {
        // HTMLが利用可能な場合はそちらを優先
        const htmlContent = Buffer.from(htmlPart.body.data, "base64").toString();
        email.body = htmlContent;
        email.isHtml = true;
      } else if (plainPart?.body?.data) {
        // プレーンテキストの場合は改行を<br>に変換
        const plainText = Buffer.from(plainPart.body.data, "base64").toString();
        email.body = plainText.replace(/\n/g, "<br>");
        email.isHtml = false;
      }
    } else if (message?.payload?.body?.data) {
      const content = Buffer.from(message.payload.body.data, "base64").toString();

      // Content-Typeをチェックしてフォーマットを決定
      const isHtml = message.payload.mimeType?.includes("html");
      if (isHtml) {
        email.body = content;
      } else {
        email.body = content.replace(/\n/g, "<br>");
      }
      email.isHtml = !!isHtml;
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
