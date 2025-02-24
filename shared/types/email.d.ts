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
  hasNextPage: boolean;
  nextPageToken?: string;
}
