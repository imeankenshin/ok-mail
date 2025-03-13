import type { Draft } from "~/shared/types/draft";

export const useDraftsStore = defineStore("drafts", {
  state: () => ({
    drafts: [] as Draft[],
    nextPageToken: null as string | null,
    isPending: false,
  }),
  actions: {
    async start(action: () => Promise<void>) {
      this.isPending = true;
      await action().finally(() => {
        this.isPending = false;
      });
    },
    async initialize() {
      await this.start(async () => {
        const requestFetch = useRequestFetch();
        const response = await requestFetch("/api/emails/draft");
        this.drafts = response.drafts;
        this.nextPageToken = response.nextPageToken;
      });
    },

    async fetchMore() {
      if (!this.nextPageToken) return;

      await this.start(async () => {
        const response = await $fetch(
          `/api/emails/draft?pageToken=${this.nextPageToken}`
        );
        this.drafts.push(...response.drafts);
        this.nextPageToken = response.nextPageToken;
      });
    },

    async moveToTrash(draftId: string) {
      const previousDrafts = this.drafts;
      this.drafts = this.drafts.filter((i) => i.id !== draftId);
      const onError = () => {
        this.drafts = previousDrafts;
      };
      await $fetch(`/api/emails/draft/${draftId}`, {
        method: "DELETE",
        onResponseError: onError,
        onRequestError: onError,
      });
    },
  },
});
