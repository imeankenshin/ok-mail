import { google } from 'googleapis'
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import prisma from '../utils/prisma'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { code } = query

  try {
    const { tokens } = await oauth2Client.getToken(code as string)
    oauth2Client.setCredentials(tokens)

    // ユーザー情報を取得
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    })
    const { data } = await oauth2.userinfo.get()

    if (!data.email) {
      throw new Error('メールアドレスを取得できませんでした')
    }

    // データベースにユーザー情報を保存または更新
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 0))
      },
      create: {
        email: data.email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 0))
      }
    })

    // フロントエンドにリダイレクト
    return sendRedirect(event, `/?auth=success&email=${encodeURIComponent(user.email)}`)
  } catch (error) {
    console.error('Error getting tokens:', error)
    return sendRedirect(event, '/?auth=error')
  }
})
