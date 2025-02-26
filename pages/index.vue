<script setup lang="ts">
import { Mail, User, Trash2, Star, Lock } from "lucide-vue-next";
import type { EmailListResponse } from "#shared/types/email";

const { data: session, error: sessionError } = await useSession(useFetch);

interface EmailState extends EmailListResponse {
  initialized: boolean;
}

// グローバルステートの定義
const emailState = useState<EmailState>("emails", () => ({
  emails: [],
  hasNextPage: false,
  nextPageToken: undefined,
  initialized: false,
}));

const loading = ref(false);

// 初回のメール取得
const initializeEmails = async () => {
  if (emailState.value.initialized) return;

  loading.value = true;
  try {
    const response = await $fetch("/api/emails");
    emailState.value = {
      emails: response.emails,
      hasNextPage: response.hasNextPage,
      nextPageToken: response.nextPageToken,
      initialized: true,
    };
  } catch (error) {
    console.error("メールの初期化に失敗しました:", error);
  }
  loading.value = false;
};

// 追加のメール取得
const fetchEmails = async () => {
  loading.value = true;
  try {
    const response = await $fetch(
      `/api/emails?pageToken=${emailState.value.nextPageToken}`
    );
    emailState.value = {
      emails: [...emailState.value.emails, ...response.emails],
      hasNextPage: response.hasNextPage,
      nextPageToken: response.nextPageToken,
      initialized: true,
    };
  } catch (error) {
    console.error("追加のメール取得に失敗しました:", error);
  }
  loading.value = false;
};

const loadMore = () => {
  fetchEmails();
};

// コンポーネントがマウントされたときに初期化
onMounted(() => {
  if (session.value && !emailState.value.initialized) {
    initializeEmails();
  }
});

const moveToTrash = async (emailId: string) => {
  const previousState = { ...emailState.value };
  try {
    emailState.value = {
      ...emailState.value,
      emails: emailState.value.emails.filter((i) => i.id !== emailId),
    };
    await $fetch(`/api/emails/${emailId}/trash`, { method: "POST" });
  } catch (error) {
    console.error("メールの削除に失敗しました:", error);
    emailState.value = previousState;
  }
};
</script>

<template>
  <div class="space-y-4">
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

    <div v-else-if="session" class="space-y-4">
      <div class="rounded-lg border bg-card">
        <div
          v-for="email in emailState.emails"
          :key="email.id"
          class="border-b last:border-0"
        >
          <NuxtLink
            :to="`/emails/${email.id}`"
            class="block p-4 hover:bg-accent transition-colors"
            :class="{ 'bg-muted': email.isRead }"
          >
            <div class="flex items-center space-x-4">
              <UiAvatar
                :class="email.isRead ? 'bg-muted-foreground' : 'bg-primary'"
              >
                <UiAvatarFallback>
                  <User class="h-4 w-4" />
                </UiAvatarFallback>
              </UiAvatar>

              <div class="flex-1 space-y-1">
                <p class="font-medium leading-none">{{ email.subject }}</p>
                <p class="text-sm text-muted-foreground">{{ email.from }}</p>
              </div>

              <div class="flex items-center space-x-2">
                <UiButton
                  variant="ghost"
                  size="icon"
                  :title="'ゴミ箱に移動'"
                  @click.prevent="moveToTrash(email.id)"
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

      <div v-if="loading" class="space-y-2">
        <UiSkeleton v-for="i in 10" :key="i" class="h-16 w-full" />
      </div>

      <UiButton
        v-if="!loading && emailState.hasNextPage"
        variant="outline"
        class="w-full"
        @click="loadMore"
      >
        もっと見る
      </UiButton>
    </div>
  </div>
</template>
