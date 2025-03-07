export const encodeMIMEMessage = (params: {
  to: string | string[],
  subject?: string,
  body: string
}) => {
  const toHeader = Array.isArray(params.to) 
    ? params.to.join(', ') 
    : params.to;

  const messageParts = [
    `To: ${toHeader}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    ...(params.subject ? [`Subject: ${params.subject}`] : []),
    '',
    params.body
  ];

  return Buffer.from(messageParts.join('\n'), 'utf-8')
    .toString('base64url');
};
