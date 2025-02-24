<script setup lang="ts">
import type { EmailListResponse } from '#shared/types/email';

const { data: session, error: sessionError } = await useSession(useFetch);

interface EmailState extends EmailListResponse {
  initialized: boolean;
}

// グローバルステートの定義
const emailState = useState<EmailState>('emails', () => ({
  emails: [],
  hasNextPage: false,
  nextPageToken: undefined,
  initialized: false
}));

const loading = ref(false);

// 初回のメール取得
const initializeEmails = async () => {
  if (emailState.value.initialized) return;

  loading.value = true;
  try {
    const response = await $fetch('/api/emails');
    emailState.value = {
      emails: response.emails,
      hasNextPage: response.hasNextPage,
      nextPageToken: response.nextPageToken,
      initialized: true
    };
  } catch (error) {
    console.error('メールの初期化に失敗しました:', error);
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
      initialized: true
    };
  } catch (error) {
    console.error('追加のメール取得に失敗しました:', error);
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
      emails: emailState.value.emails.filter((i) => i.id !== emailId)
    };
    await $fetch(`/api/emails/${emailId}/trash`, { method: "POST" });
  } catch (error) {
    console.error("メールの削除に失敗しました:", error);
    emailState.value = previousState;
  }
};
</script>

<template>
  <div>
    <v-alert v-if="!session" color="info" icon="mdi-google">
      <template #title> Gmailとの連携が必要です </template>
      <template #text>
        <v-btn
          color="primary"
          @click="
            signIn.social({
              provider: 'google',
              callbackURL: '/',
            })
          "
        >
          Googleアカウントで認証
        </v-btn>
      </template>
    </v-alert>

    <v-alert v-if="sessionError" color="error" icon="mdi-alert">
      {{ sessionError }}
    </v-alert>

    <template v-else-if="session">
      <v-list lines="two">
        <v-list-item
          v-for="email in emailState.emails"
          :key="email.id"
          :title="email.subject"
          :subtitle="email.from"
          :to="`/emails/${email.id}`"
          link
          :class="{ 'grey lighten-3': email.isRead }"
        >
          <template #prepend>
            <v-avatar :color="email.isRead ? 'grey-lighten-1' : 'primary'">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>

          <template #append>
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                :title="'ゴミ箱に移動'"
                @click.prevent="moveToTrash(email.id)"
              />
              <v-btn icon="mdi-star-outline" variant="text" />
            </div>
          </template>
        </v-list-item>
      </v-list>

      <!-- 追加のメールを読み込み中の表示 -->
      <v-skeleton-loader v-if="loading" type="list-item@10" class="mt-4" />
      <v-btn
        v-if="!loading && emailState.hasNextPage"
        block
        color="primary"
        class="mt-4"
        @click="loadMore"
      >
        もっと見る
      </v-btn>
    </template>
  </div>
</template>
