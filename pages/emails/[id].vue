<script setup lang="ts">
const route = useRoute();
const emailId = route.params.id as ":id";

const { data: email, status } = await useFetch(`/api/emails/${emailId}`, {});
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
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="email.body" />
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </div>
</template>
]]>
