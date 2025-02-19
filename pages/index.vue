<script setup lang="ts">
const { data: session, error: sessionError } = await useSession(useFetch);
const { data: emails, status } = await useFetch("/api/emails", {
  lazy: true,
});
const prevEmails = usePrevious(emails, null);

const moveToTrash = async (emailId: string) => {
  try {
    emails.value = {
      emails: emails.value?.emails.filter((i) => i.id !== emailId) ?? [],
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
    </template>
  </div>
</template>
