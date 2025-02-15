import { google } from 'googleapis'
import { defineEventHandler, getHeader } from 'h3'
import prisma from '../../utils/prisma'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export default defineEventHandler(async (event) => {
  try {
    // メールアドレスをヘッダーから取得
    const email = getHeader(event, 'x-user-email')
    if (!email) {
      throw new Error('認証が必要です')
    }

    // データベースからユーザーの認証情報を取得
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('ユーザーが見つかりません')
    }

    // アクセストークンが期限切れの場合は更新
    if (new Date() >= user.expiresAt) {
      if (!user.refreshToken) {
        throw new Error('再認証が必要です')
      }

      oauth2Client.setCredentials({
        refresh_token: user.refreshToken
      })

      const { credentials } = await oauth2Client.refreshAccessToken()
      await prisma.user.update({
        where: { email },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: new Date(Date.now() + (credentials.expiry_date || 0))
        }
      })
    }

    // 認証情報を設定
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10
    })

    const messages = response.data.messages || []
    const emails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id as string
        })
        
        const headers = email.data.payload?.headers
        const subject = headers?.find(h => h.name === 'Subject')?.value
        const from = headers?.find(h => h.name === 'From')?.value
        
        return {
          id: email.data.id,
          subject: subject || '(件名なし)',
          from: from || '不明',
          snippet: email.data.snippet
        }
      })
    )

    return { emails }
  } catch (error) {
    console.error('Error fetching emails:', error)
    return { error: 'Failed to fetch emails' }
  }
})
