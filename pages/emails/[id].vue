<script setup lang="ts">
const route = useRoute();
const emailId = route.params.id as ":id";
const emailFrame = ref<HTMLIFrameElement>();

const { data: email, status } = await useFetch(`/api/emails/${emailId}`, {
  lazy: true,
});

const resizeIframe = () => {
  if (emailFrame.value) {
    emailFrame.value.style.height =
      emailFrame.value.contentWindow?.document.documentElement.scrollHeight +
      "px";
  }
};
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
              <template v-if="email.isHtml">
                <iframe
                  ref="emailFrame"
                  :srcdoc="email.body"
                  class="email-html-content"
                  frameborder="0"
                  @load="resizeIframe"
                />
              </template>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-else class="email-plain-content" v-html="email.body" />
            </v-card-text>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.email-html-content {
  width: 100%;
  border: none;
  min-height: 100px;
}

.email-plain-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #24292e;
  padding: 1rem;
}
</style>
