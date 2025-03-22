import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { Draft } from "~/shared/types/draft";

export default defineVerifiedOnlyEventHandler(async (event) => {
  const gmail = google.gmail({
    version: "v1",
    auth: event.context.oAuth2Client,
  });

  const { error, data: response } = await tryCatch(
    gmail.users.drafts.list({
      userId: "me",
      maxResults: 20, // 取得する下書きの最大数
    })
  );

  if (error) {
    throw createError({
      statusCode: 500,
      message: "下書きの一覧取得に失敗しました",
      cause: error,
    });
  }

  const drafts = await Promise.all(
    (response.data.drafts || []).map(async (draft) => {
      const draftId = draft.id;
      if (!draftId) return null;

      const { error, data: draftDetails } = await tryCatch(
        gmail.users.drafts.get({
          userId: "me",
          id: draftId,
          format: "full",
        })
      );

      if (error) {
        throw createError({
          statusCode: 500,
          message: `Failed to get draft`,
          cause: error,
        });
      }

      return {
        id: draft.id!,
        subject:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "Subject"
          )?.value || "(件名なし)",
        date:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "Date"
          )?.value || "(日付なし)",
        from:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "From"
          )?.value || "(送信者なし)",
        to:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "To"
          )?.value || "(宛先なし)",
      } satisfies Draft;
    })
  );

  return {
    drafts: drafts.filter(Boolean) as Draft[],
    nextPageToken: response.data.nextPageToken || null,
  };
});
