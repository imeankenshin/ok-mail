<script setup lang="ts">
const { data: session, error: sessionError } = await useSession(useFetch);
const { data: emails, status } = await useFetch("/api/emails", {
  lazy: true,
});
const prevEmails = usePrevious(emails, null);
const loading = ref(false);

const fetchEmails = async () => {
  loading.value = true;
  console.log(emails.value?.nextPageToken);
  const response = await $fetch(
    `/api/emails?pageToken=${emails.value?.nextPageToken}`
  );
  const newEmails = response;
  emails.value = {
    emails: [...(emails.value?.emails ?? []), ...newEmails.emails],
    hasNextPage: newEmails.hasNextPage,
    nextPageToken: newEmails.nextPageToken,
  };
  loading.value = false;
};

const loadMore = () => {
  fetchEmails();
};

const moveToTrash = async (emailId: string) => {
  try {
    emails.value = {
      emails: emails.value?.emails.filter((i) => i.id !== emailId) ?? [],
      hasNextPage: !!emails.value?.hasNextPage,
      nextPageToken: emails.value?.nextPageToken,
    };
    await $fetch(`/api/emails/${emailId}/trash`, { method: "POST" });
  } catch (error) {
    console.error("メールの削除に失敗しました:", error);
    emails.value = prevEmails.value;
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
      <v-progress-linear v-if="status === 'pending'" indeterminate />
      <v-list lines="two">
        <v-list-item
          v-for="email in emails?.emails"
          :key="email.id"
          :title="email.subject"
          :subtitle="email.from"
          :to="`/emails/${email.id}`"
          link
        >
          <template #prepend>
            <v-avatar color="grey-lighten-1">
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
        v-if="!loading && emails?.hasNextPage"
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
