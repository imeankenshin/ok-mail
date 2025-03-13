import type { EmailListResponse } from "~/shared/types/email";

type EmailStore = EmailListResponse & {
  isPending: boolean;
}

export const useEmailsStore = defineStore('emails', {
  state: (): EmailStore => ({
    emails: [],
    nextPageToken: undefined,
    isPending: false
  }),
  actions: {
    async start(action: () => Promise<void>) {
      this.isPending = true;
      await action().catch(console.error).finally(() => {
        this.isPending = false;
      });
    },
    async initialize() {
      await this.start(async () => {
        const requestFetch = useRequestFetch();
        const response = await requestFetch("/api/emails");
        this.emails = response.emails;
        this.nextPageToken = response.nextPageToken;
      });
    },

    async fetchMore() {
      if (!this.nextPageToken) return;

      await this.start(async () => {
        const response = await $fetch(
          `/api/emails?pageToken=${this.nextPageToken}`
        );
        this.emails.push(...response.emails);
        this.nextPageToken = response.nextPageToken;
      });
    },

    async moveToTrash(emailId: string) {
      const previousMails = this.emails;
      this.emails = this.emails.filter((i) => i.id !== emailId);
      const onError = () => {
        this.emails = previousMails;
      };
      await this.start(async () => {
        await $fetch(`/api/emails/${emailId}/trash`, {
          method: "POST",
          onResponseError: onError,
          onRequestError: onError
        });
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
      await this.start(async () => {
        await $fetch(`/api/emails/${emailId}/mark-as-read`, {
          method: "POST",
          onResponseError: onError,
          onRequestError: onError
        });
      });
    }
  }
})
