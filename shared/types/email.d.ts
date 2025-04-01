export interface Email {
  id: string;
  threadId: string;
  fromName?: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  bimiLogoUrl?: string;
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
