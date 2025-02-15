<script setup>
const route = useRoute();
const authStore = useAuthStore();
const emails = ref([]);
const loading = ref(false);

const fetchEmails = async () => {
  if (!authStore.userEmail) return;

  loading.value = true;
  try {
    const response = await fetch('/api/emails', {
      headers: {
        'x-user-email': authStore.userEmail
      }
    });
    
    if (!response.ok) {
      throw new Error('メールの取得に失敗しました');
    }

    const data = await response.json();
    if (data.emails) {
      emails.value = data.emails;
    }
  } catch (error) {
    console.error('メールの取得に失敗しました:', error);
    authStore.setError('メールの取得に失敗しました');
  } finally {
    loading.value = false;
  }
};

const authenticate = async () => {
  try {
    const response = await fetch("/api/auth");
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("認証に失敗しました:", error);
    authStore.setError("認証に失敗しました");
  }
};

const toggleStar = async (email) => {
  // Gmail APIでスター付けを実装予定
  email.starred = !email.starred;
};

onMounted(() => {
  // URLパラメータから認証状態を確認
  const auth = route.query.auth;
  const email = route.query.email;

  if (auth === "success" && email) {
    authStore.setAuthenticated(String(email));
    fetchEmails();
  } else if (auth === "error") {
    authStore.setError("認証に失敗しました");
  }
});
</script>

<template>
  <div>
    <v-alert v-if="!authStore.isAuthenticated" color="info" icon="mdi-google">
      <template v-slot:title> Gmailとの連携が必要です </template>
      <template v-slot:text>
        <v-btn color="primary" @click="authenticate">
          Googleアカウントで認証
        </v-btn>
      </template>
    </v-alert>

    <v-alert v-if="authStore.error" color="error" icon="mdi-alert">
      {{ authStore.error }}
    </v-alert>

    <template v-else-if="authStore.isAuthenticated">
      <v-progress-linear v-if="loading" indeterminate />

      <v-list lines="two">
        <v-list-item
          v-for="email in emails"
          :key="email.id"
          :title="email.subject"
          :subtitle="email.from"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>

          <template v-slot:append>
            <v-btn
              icon="mdi-star-outline"
              variant="text"
              @click="toggleStar(email)"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>
