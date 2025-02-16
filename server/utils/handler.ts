import { auth } from "~/utils/auth";
import {
  defineEventHandler,
  type EventHandler,
  type H3Event,
  type EventHandlerRequest,
} from "h3";
import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { env } from "~/env";
import prisma from "~/server/utils/prisma";

type AuthenticatedOnlyEventHandlerContext = {
  oauth2Client: OAuth2Client;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
};

type AuthenticatedOnlyEventHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  context: AuthenticatedOnlyEventHandlerContext
) => Promise<D>;

// リクエストしたユーザーが認証されている場合にのみ処理を実行する
export const defineAuthenticatedOnlyEventHandler = <
  T extends EventHandlerRequest,
  D
>(
  handler: AuthenticatedOnlyEventHandler<T, D>
): EventHandler<T, D> => {
  return defineEventHandler<T>(async (event) => {
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    const session = await auth.api.getSession({
      headers: event.headers,
    })

    if (!session)
      return createError({ statusCode: 401, message: "Unauthorized" });

    // データベースからユーザーの認証情報を取得
    const user = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!user) return createError({ statusCode: 401, message: "Unauthorized" });

    // アクセストークンが期限切れの場合は更新
    if (new Date() >= session.session.expiresAt) {
      if (!user.refreshToken)
        return createError({ statusCode: 401, message: "Unauthorized" });

      oauth2Client.setCredentials({
        refresh_token: user.refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      await prisma.account.update({
        where: { id: user.id },
        data: {
          accessToken: credentials.access_token!,
          accessTokenExpiresAt: new Date(
            Date.now() + (credentials.expiry_date || 0)
          ),
        },
      });
    }

    // 認証情報を設定
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    return handler(event, {
      oauth2Client,
      session,
    });
  });
};
