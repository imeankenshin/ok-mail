<script setup>
const router = useRouter();
const sending = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const errors = ref({
  to: [],
  subject: [],
  body: [],
});

const email = ref({
  to: "",
  subject: "",
  body: "",
});

const isValid = computed(() => {
  return email.value.to && email.value.subject && email.value.body;
});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validate = () => {
  errors.value = {
    to: [],
    subject: [],
    body: [],
  };

  if (!email.value.to) {
    errors.value.to.push("宛先は必須です");
  } else if (!validateEmail(email.value.to)) {
    errors.value.to.push("正しいメールアドレスを入力してください");
  }

  if (!email.value.subject) {
    errors.value.subject.push("件名は必須です");
  }

  if (!email.value.body) {
    errors.value.body.push("本文は必須です");
  }

  return !Object.values(errors.value).some((field) => field.length > 0);
};

const sendEmail = async () => {
  if (!validate()) return;

  sending.value = true;
  try {
    const response = await fetch("/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email.value),
    });

    const result = await response.json();
    if (result.success) {
      router.push("/");
    } else {
      throw new Error(result.error || "メールの送信に失敗しました");
    }
  } catch (error) {
    console.error("メール送信エラー:", error);
    errorMessage.value =
      error.message || "メールの送信中にエラーが発生しました";
    showError.value = true;
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <v-card>
    <v-card-title>新規メール作成</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="sendEmail">
        <v-text-field
          v-model="email.to"
          label="宛先"
          required
          :error-messages="errors.to"
        />
        <v-text-field
          v-model="email.subject"
          label="件名"
          required
          :error-messages="errors.subject"
        />
        <v-textarea
          v-model="email.body"
          label="本文"
          required
          rows="10"
          :error-messages="errors.body"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            type="submit"
            :loading="sending"
            :disabled="!isValid"
          >
            送信
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>

    <v-snackbar v-model="showError" color="error">
      {{ errorMessage }}
      <template #actions>
        <v-btn color="white" variant="text" @click="showError = false">
          閉じる
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>
