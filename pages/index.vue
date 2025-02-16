<script setup lang="ts">
const { data: session, error: sessionError } = await useSession(useFetch);
const { data: emails, status } = useFetch("/api/emails", {
  onResponse: (response) => {
    console.log(response);
  },
});
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
          v-for="email in emails.emails"
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
