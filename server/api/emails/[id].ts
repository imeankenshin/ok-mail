import type { gmail_v1 } from "googleapis";
import { google } from "googleapis";
import { JSDOM } from "jsdom";
import type { CssAtRuleAST } from "@adobe/css-tools";
import { parse, stringify } from "@adobe/css-tools";
import { tryCatch } from "~/shared/utils/try-catch";

type CommonEmail = {
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isHtml: boolean;
  isRead: boolean;
};

type HTMLEmail = CommonEmail & {
  isHtml: true;
  styleSheet: string | null;
  lang: string;
};

type PlainEmail = CommonEmail & {
  isHtml: false;
};

type GetEmailResponce = PlainEmail | HTMLEmail;

export default defineVerifiedOnlyEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "無効なメールIDです",
    });
  }

  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });

  const { error, data: getResponse } = await tryCatch(
    gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    })
  );

  if (error) {
    throw createError({
      statusCode: 500,
      message: "メールの取得に失敗しました",
      cause: error,
    });
  }

  const message = getResponse.data;
  return createGetEmailResponce(message);
});

function getContent(message: gmail_v1.Schema$Message): string {
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
      return Buffer.from(parts[0].body.data, "base64").toString();
    }
  }
  if (message?.payload?.body?.data) {
    return Buffer.from(message.payload.body.data, "base64").toString();
  }
  return "";
}

function createGetEmailResponce(
  message: gmail_v1.Schema$Message
): GetEmailResponce {
  const headers = message?.payload?.headers || [];
  const content = getContent(message);
  const plainEmail: PlainEmail = {
    subject: headers?.find((h) => h.name === "Subject")?.value || "(件名なし)",
    from: headers?.find((h) => h.name === "From")?.value || "",
    to: headers?.find((h) => h.name === "To")?.value || "",
    date: headers?.find((h) => h.name === "Date")?.value || "",
    body: content,
    isRead: !!message.labelIds && !message.labelIds.includes("UNREAD"),
    isHtml: false,
  };
  if (headers.find((h) => h.name === "Content-Type")?.value === "text/plain")
    return plainEmail;
  const document = new JSDOM(content).window.document;
  document.querySelectorAll("script").forEach((scriptElement) => {
    scriptElement.remove();
  });
  document.querySelectorAll("a").forEach((anchor) => {
    anchor.target = "_blank";
  });
  return {
    ...plainEmail,
    body: document.body.innerHTML,
    isHtml: true,
    styleSheet: Array.from(document.querySelectorAll("style"))
      .map((el) => el.textContent)
      .map((text) => {
        if (!text) return null;
        const parsed = (parse(text, {silent: true}));
        if (parsed.stylesheet.parsingErrors) return null;
        transfrom(parsed.stylesheet);
        return stringify(parsed);
      })
      .filter((el) => el !== null)
      .join("\n"),
    lang: document.documentElement.lang || "",
  };
}

// CssAtRuleASTのうち、rulesを含むもの
function transfrom(rules: { rules: CssAtRuleAST[] }) {
  rules.rules.forEach((rule) => {
    switch (rule.type) {
      case "rule":
        rule.selectors = rule.selectors.map((selector) => {
          if (selector === "body" || selector === "html") {
            return ".___body";
          }
          return `.___body ${selector}`;
        });
        break;
      case "media":
      case "container":
      case "host":
      case "document":
      case "supports":
      case "starting-style":
        transfrom(rule);
        break;
      default:
        break;
    }
  });
  return rules;
}
