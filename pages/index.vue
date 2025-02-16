<script setup lang="ts">
const session = authClient.useSession();
const { data, error, status } = useFetch("/api/emails", {
  lazy: true,
});
</script>

<template>
  <div>
    <v-progress-linear
      v-if="status === 'pending' || session.isPending"
      indeterminate
      class="mb-4"
    />

    <!-- if error is 401 or session does not exist -->
    <v-alert
      v-else-if="!session.data || error?.status === 401"
      color="info"
      icon="mdi-google"
    >
      <template #title> Gmailとの連携が必要です </template>
      <template #text>
        <v-btn
          color="primary"
          @click="
            authClient.signIn.social({
              provider: 'google',
            })
          "
        >
          Googleアカウントで認証
        </v-btn>
      </template>
    </v-alert>

    <template v-else-if="error">
      <v-alert color="error" icon="mdi-alert" class="mb-4">
        {{ error.message || "メールの取得に失敗しました" }}
      </v-alert>
    </template>

    <v-alert
      v-else-if="!data?.emails.length"
      color="info"
      icon="mdi-email-outline"
      class="mt-4"
    >
      メールがありません
    </v-alert>

    <template v-else-if="data?.emails.length">
      <v-list lines="two">
        <v-list-item
          v-for="email in data.emails"
          :key="email.id"
          :title="email.subject"
          :subtitle="email.from"
        >
          <template #prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>

          <template #append>
            <v-btn icon="mdi-star-outline" variant="text" />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>
