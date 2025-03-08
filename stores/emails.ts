import type { EmailListResponse } from "~/shared/types/email";

type EmailStore = EmailListResponse

export const useEmailsStore = defineStore('emails', {
  state: (): EmailStore => ({
    emails: [],
    nextPageToken: undefined,
  }),
  actions: {
    async initialize() {
      const response = await $fetch("/api/emails");
      this.emails = response.emails;
      this.nextPageToken = response.nextPageToken;
    },

    async fetchMore() {
      if (!this.nextPageToken) return;

      const response = await $fetch(
        `/api/emails?pageToken=${this.nextPageToken}`
      );
      this.emails.push(...response.emails);
      this.nextPageToken = response.nextPageToken;
    },

    async moveToTrash(emailId: string) {
      const previousMails = this.emails;
      this.emails = this.emails.filter((i) => i.id !== emailId);
      const onError = () => {
        this.emails = previousMails;
      };
      await $fetch(`/api/emails/${emailId}/trash`, {
        method: "POST",
        onResponseError: onError,
        onRequestError: onError
      });
    },
    async markAsRead(emailId: string) {
      const previousMails = this.emails;
      this.emails = this.emails.map((i) => {
        if (i.id === emailId) {
          return {
            ...i,
            isRead: true
          };
        }
        return i;
      });
      const onError = () => {
        this.emails = previousMails;
      };
      await $fetch(`/api/emails/${emailId}/mark-as-read`, {
        method: "POST",
        onResponseError: onError,
        onRequestError: onError
      });
    }
  }
})
