import { auth } from "@/lib/auth";
import type {
  EventHandlerRequest,
  EventHandlerResponse,
  H3EventContext,
  EventHandler,
} from "h3";
import { H3Event } from "h3";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { tryCatch } from "~/shared/utils/try-catch";
import prisma from "~/lib/prisma";
import { env } from "~/env";

class VerifiedEvent<T extends EventHandlerRequest> extends H3Event<T> {
  declare context: H3EventContext & {
    session: Awaited<ReturnType<typeof auth.api.getSession>>;
    oAuth2Client: OAuth2Client;
  };
}

type VerifiedEventHandler<T extends EventHandlerRequest, D> = (
  event: VerifiedEvent<T>,
) => EventHandlerResponse<D>;

export function defineVerifiedOnlyEventHandler<
  T extends EventHandlerRequest,
  D,
>(handler: VerifiedEventHandler<T, D>): EventHandler<T, D> {
  return defineEventHandler<T>(async (event) => {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        cause: "No session found",
      });
    }

    const oauth2Client = new google.auth.OAuth2({
      clientId: env.GOOGLE_CLIENT_ID,
      apiKey: env.GOOGLE_API_KEY,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    });

    const account = await prisma.account.findFirst({
      where: { userId: session.session.userId },
    });

    if (!account) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        cause: "No account found",
      });
    }

    // 認証情報を設定
    oauth2Client.setCredentials({
      expiry_date: account.accessTokenExpiresAt!.getTime(),
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    if (new Date() >= account.accessTokenExpiresAt!) {
      if (!account.refreshToken) {
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
          cause: "No refresh token",
        });
      }

      const { data: credentials, error } = await tryCatch(
        oauth2Client.refreshAccessToken().then((res) => res.credentials),
      );

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to refresh access token",
          cause: error,
        });
      }
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: credentials.access_token!,
          accessTokenExpiresAt: new Date(credentials.expiry_date || 0),
        },
      });
    }

    return handler(createVerifiedEvent(event, oauth2Client, session));
  });
}

function createVerifiedEvent<T extends EventHandlerRequest>(
  event: H3Event<T>,
  oauth2Client: OAuth2Client,
  session: Awaited<ReturnType<typeof auth.api.getSession>>,
): VerifiedEvent<T> {
  event.context.oAuth2Client = oauth2Client;
  event.context.session = session;
  return event as VerifiedEvent<T>;
}
