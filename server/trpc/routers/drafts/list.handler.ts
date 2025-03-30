import { google } from "googleapis";
import { tryCatch } from "~/shared/utils/try-catch";
import type { Draft } from "~/shared/types/draft";
import type { OAuth2Client } from "google-auth-library";
import { TRPCError } from "@trpc/server";
import type { TListDraftsInput } from "./list.schema";

export const listDraftsHandler = async ({
  ctx,
  input,
}: {
  ctx: { oauth2Client: OAuth2Client };
  input: TListDraftsInput;
}) => {
  const gmail = google.gmail({
    version: "v1",
    auth: ctx.oauth2Client,
  });

  const { error, data: response } = await tryCatch(
    gmail.users.drafts.list({
      userId: "me",
      maxResults: 10, // 取得する下書きの最大数
      pageToken: input.pageToken ?? undefined,
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list drafts",
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
        }),
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get draft`,
          cause: error,
        });
      }

      return {
        id: draft.id!,
        subject:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "Subject",
          )?.value || "(件名なし)",
        date:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "Date",
          )?.value || "(日付なし)",
        from:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "From",
          )?.value || "(送信者なし)",
        to:
          draftDetails.data.message?.payload?.headers?.find(
            (header) => header.name === "To",
          )?.value || "(宛先なし)",
      } satisfies Draft;
    }),
  );

  return {
    drafts: drafts.filter(Boolean) as Draft[],
    nextPageToken: response.data.nextPageToken || null,
  };
};
