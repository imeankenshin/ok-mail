<script setup lang="ts">
import { Mail, User, Trash2, Star, Lock } from "lucide-vue-next";
import type { Draft } from "~/shared/types/draft";

const { data: session, error: sessionError } = await useSession(useFetch);

// グローバルステートの定義
const draftState = useState("drafts", () => ({
  drafts: [] as Draft[],
  hasNextPage: false,
  nextPageToken: null as string | null,
  initialized: false,
}));

const loading = ref(false);

// 初回のメール取得
const initializeEmails = async () => {
  if (draftState.value.initialized) return;

  loading.value = true;
  const response = await $fetch("/api/emails/draft");
  draftState.value = {
    drafts: response.drafts,
    hasNextPage: response.hasNextPage,
    nextPageToken: response.nextPageToken || null,
    initialized: true,
  };
  loading.value = false;
};

// 追加のメール取得
const fetchEmails = async () => {
  loading.value = true;
  const response = await $fetch(
    `/api/emails/draft?pageToken=${draftState.value.nextPageToken}`
  );
  draftState.value = {
    drafts: [...draftState.value.drafts, ...response.drafts],
    hasNextPage: response.hasNextPage,
    nextPageToken: response.nextPageToken || null,
    initialized: true,
  };
  loading.value = false;
};

const loadMore = () => {
  fetchEmails();
};

// コンポーネントがマウントされたときに初期化
onMounted(() => {
  if (session.value && !draftState.value.initialized) {
    initializeEmails();
  }
});

const moveToTrash = async (draftId: string) => {
  const previousState = { ...draftState.value };
  draftState.value = {
    ...draftState.value,
    drafts: draftState.value.drafts.filter((i) => i.id !== draftId),
  };
  $fetch(`/api/emails/${draftId}/trash`, {
    method: "POST",
    onResponseError() {
      draftState.value = previousState;
    },
    onRequestError() {

    }
  });
};
</script>

<template>
  <div>
    <UiAlert v-if="!session">
      <Lock class="size-4" />
      <UiAlertTitle>Gmailとの連携が必要です</UiAlertTitle>
      <UiAlertDescription>
        Gmailとの連携を行うには、Googleアカウントで認証を行なってください。
        <UiButton
          variant="default"
          @click="
            signIn.social({
              provider: 'google',
              callbackURL: '/',
            })
          "
        >
          <Mail class="mr-2 h-4 w-4" />
          Googleアカウントで認証
        </UiButton>
      </UiAlertDescription>
    </UiAlert>

    <UiAlert v-if="sessionError" variant="destructive">
      <UiAlertTitle>エラー</UiAlertTitle>
      <UiAlertDescription>{{ sessionError }}</UiAlertDescription>
    </UiAlert>

    <div v-else-if="session">
      <div v-if="draftState.drafts.length">
        <div
          v-for="draft in draftState.drafts"
          :key="draft.id"
          class="border-b last:border-0"
        >
          <NuxtLink
            :to="`/compose?draftId=${draft.id}`"
            class="block p-4 hover:bg-accent transition-colors"
          >
            <div class="flex items-center space-x-4">
              <UiAvatar>
                <UiAvatarFallback>
                  <User class="h-4 w-4" />
                </UiAvatarFallback>
              </UiAvatar>
              <div class="flex-1 space-y-1">
                <p class="font-medium leading-none">{{ draft.subject }}</p>
                <p class="text-sm text-red-500">下書き</p>
              </div>
              <div class="flex items-center space-x-2">
                <UiButton
                  variant="ghost"
                  size="icon"
                  :title="'ゴミ箱に移動'"
                  @click.prevent="moveToTrash(draft.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </UiButton>
                <UiButton variant="ghost" size="icon">
                  <Star class="h-4 w-4" />
                </UiButton>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading">
        <div v-for="i in 10" :key="i" class="block p-4">
          <div class="flex items-center space-x-4">
            <UiSkeleton class="size-10 rounded-full" />
            <div class="flex-1">
              <UiSkeleton class="h-4 w-full max-w-sm" />
              <UiSkeleton class="h-5 mt-1 w-full max-w-64" />
            </div>
          </div>
        </div>
      </div>

      <UiButton
        v-if="!loading && draftState.hasNextPage"
        variant="outline"
        class="w-full"
        @click="loadMore"
      >
        もっと見る
      </UiButton>
    </div>
  </div>
</template>
