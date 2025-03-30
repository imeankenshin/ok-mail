import { auth } from "~/lib/auth";
import { env } from "~/env";
import { google } from "googleapis";
import prisma from "~/lib/prisma";
import { TRPCError } from "@trpc/server";
import { tryCatch } from "~/shared/utils/try-catch";
import type { H3Event } from "h3";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (event: H3Event) => {
  const headers = new Headers(getHeaders(event) as Record<string, string>);
  const { data: session, error } = await tryCatch(
    auth.api.getSession({
      headers,
    }),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get session",
      cause: error,
    });
  }

  if (!session)
    return {
      session: null,
      oauth2Client: null,
    };

  const oauth2Client = new google.auth.OAuth2({
    clientId: env.GOOGLE_CLIENT_ID,
    apiKey: env.GOOGLE_API_KEY,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  });

  const { data: account, error: accountError } = await tryCatch(
    prisma.account.findFirst({
      where: { userId: session.session.userId },
    }),
  );

  if (accountError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get account",
      cause: accountError,
    });
  }

  if (!account) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No account found",
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
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No refresh token",
      });
    }

    const { data: credentials, error: credentialsError } = await tryCatch(
      oauth2Client.refreshAccessToken().then((res) => res.credentials),
    );

    if (credentialsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to refresh access token",
        cause: credentialsError,
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
  return {
    session,
    oauth2Client,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createContext>>;
