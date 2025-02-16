import { google } from 'googleapis'

export default defineVerifiedOnlyEventHandler(async (event) => {
  const gmail = google.gmail({ version: 'v1', auth: event.context.oAuth2Client })
  const id = getRouterParam(event, 'id')

  try {
    // TODO: Make getting email faster. It takes at least over 300ms
    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full'
    })

    const message = response.data
    const headers = message?.payload?.headers

    const email = {
      subject: headers?.find(h => h.name === 'Subject')?.value || '(件名なし)',
      from: headers?.find(h => h.name === 'From')?.value || '',
      to: headers?.find(h => h.name === 'To')?.value || '',
      date: headers?.find(h => h.name === 'Date')?.value || '',
      body: ''
    }

    // メール本文の取得
    if (message?.payload?.parts) {
      const textPart = message.payload.parts.find(part =>
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      )
      if (textPart?.body?.data) {
        console.time("decode")
        email.body = Buffer.from(textPart.body.data, 'base64').toString()
        console.timeEnd("decode")
      }
    } else if (message?.payload?.body?.data) {
      console.time("decode")
      email.body = Buffer.from(message.payload.body.data, 'base64').toString()
      console.timeEnd("decode")
    }

    return email
  } catch (error) {
    console.error('Error fetching email:', error)
    throw createError({
      statusCode: 500,
      message: 'メールの取得に失敗しました'
    })
  }
})
