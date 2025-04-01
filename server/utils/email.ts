export function extractFrom(from: string): { name?: string; email: string } {
  const match = from.match(/"(.*?)" <(.*?)>/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  const emailMatch = from.match(/<(.*?)>/);
  if (emailMatch) {
    return { email: emailMatch[1] };
  }
  return { email: from };
}
