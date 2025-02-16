import { auth } from "~/utils/auth";
import type {
  EventHandlerRequest,
  EventHandlerResponse,
  H3EventContext,
  EventHandler,
} from "h3";
import { H3Event } from "h3";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

class VerifiedEvent<T extends EventHandlerRequest> extends H3Event<T> {
  declare context: H3EventContext & {
    session: Awaited<ReturnType<typeof auth.api.getSession>>;
    oAuth2Client: OAuth2Client;
  };
}

type VerifiedEventHandler<T extends EventHandlerRequest, D> = (
  event: VerifiedEvent<T>
) => EventHandlerResponse<D>;

export function defineVerifiedOnlyEventHandler<
  T extends EventHandlerRequest,
  D
>(handler: VerifiedEventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const oauth2Client = new google.auth.OAuth2({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const account = await prisma.account.findFirst({
      where: { userId: session.session.userId },
    });

    if (!account) {
      throw new Error("アカウントが存在しません");
    }

    if (new Date() >= session.session.expiresAt) {
      if (!account.refreshToken) {
        throw new Error("再認証が必要です");
      }

      oauth2Client.setCredentials({
        refresh_token: account.refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      await prisma.account.update({
        where: { id: account.id },
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
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const passedEvent = {
      ...event,
      context: {
        ...event.context,
        session,
        oAuth2Client: oauth2Client,
      },
    } as VerifiedEvent<T>;
    return handler(passedEvent);
  });
}
