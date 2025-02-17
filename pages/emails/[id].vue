<script setup lang="ts">
const route = useRoute();
const emailId = route.params.id as ":id";

const { data: email, status } = await useFetch(`/api/emails/${emailId}`, {
  lazy: true,
});
</script>

<template>
  <div>
    <v-app-bar>
      <v-btn icon="mdi-arrow-left" to="/" />
      <v-app-bar-title>メール詳細</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-progress-linear v-if="status === 'pending'" indeterminate />

        <template v-else-if="email">
          <v-card>
            <v-card-title>{{ email.subject }}</v-card-title>
            <v-card-subtitle>
              <div>From: {{ email.from }}</div>
              <div>To: {{ email.to }}</div>
              <div>Date: {{ new Date(email.date).toLocaleString() }}</div>
            </v-card-subtitle>
            <v-divider />
            <v-card-text>
              <div
                :class="{
                  'email-html-content': email.isHtml,
                  'email-plain-content': !email.isHtml
                }"
                v-html="email.body"
              />
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.email-html-content {
  max-width: 100%;
  overflow-x: auto;
}

.email-html-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.email-plain-content {
  white-space: pre-wrap;
  font-family: monospace;
  line-height: 1.5;
}
</style>
