import type { Draft } from "~/shared/types/draft";
import { tryCatch } from "~/shared/utils/try-catch";

export const useDraftsStore = defineStore("drafts", () => {
  const drafts = ref<Draft[]>([]);
  const nextPageToken = ref<string | null>(null);
  const isPending = ref(false);
  const { $trpc } = useNuxtApp();

  const start = async (action: () => Promise<void>) => {
    isPending.value = true;
    await action().finally(() => {
      isPending.value = false;
    });
  };

  const initialize = async () => {
    await start(async () => {
      const response = await $trpc.drafts.list.query({});
      drafts.value = response.drafts;
      nextPageToken.value = response.nextPageToken;
    });
  };

  const fetchMore = async () => {
    const pageToken = nextPageToken.value;
    if (!pageToken) return;

    await start(async () => {
      const response = await $trpc.drafts.list.query({
        pageToken,
      });
      drafts.value.push(...response.drafts);
      nextPageToken.value = response.nextPageToken;
    });
  };

  const trash = async (draftId: string) => {
    const previousDrafts = [...drafts.value];
    drafts.value = drafts.value.filter((i) => i.id !== draftId);
    const onError = () => {
      drafts.value = previousDrafts;
    };

    const { error } = await tryCatch(
      $trpc.drafts.delete.mutate({
        draftId,
      })
    );

    if (error) {
      onError();
    }
  };

  return {
    drafts,
    nextPageToken,
    isPending,
    start,
    initialize,
    fetchMore,
    trash,
  };
});
