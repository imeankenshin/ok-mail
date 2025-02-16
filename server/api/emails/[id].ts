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
    };

    // メール本文の取得
    if (message?.payload?.parts) {
      const textPart = message.payload.parts.find(
        (part) =>
          part.mimeType === "text/plain" || part.mimeType === "text/html"
      );
      if (textPart?.body?.data) {
        email.body = Buffer.from(textPart.body.data, "base64").toString();
      }
    } else if (message?.payload?.body?.data) {
      email.body = Buffer.from(message.payload.body.data, "base64").toString();
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
