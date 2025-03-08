export interface Email {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
}

export interface EmailListResponse {
  emails: Email[];
  nextPageToken?: string;
}

export interface EmailDraft {
  to: string[];
  subject: string;
  body: string;
  draftId?: string | null;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}
