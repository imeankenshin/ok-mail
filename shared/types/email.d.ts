export interface Email {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

export interface EmailListResponse {
  emails: Email[];
  hasNextPage: boolean;
  nextPageToken?: string;
}
