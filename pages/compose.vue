<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { tryCatch } from "~/shared/utils/error";

const router = useRouter();
const sending = ref(false);
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

const validateEmail = (email: string) => {
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
  const [_, error] = await tryCatch(() =>
    $fetch("/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email.value),
    })
  );

  if (!error) {
    router.push("/");
  }

  sending.value = false;
};
</script>

<template>
  <UiCard class="w-full max-w-2xl mx-auto">
    <UiCardHeader>
      <UiCardTitle>新規メール作成</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <form class="space-y-4" @submit.prevent="sendEmail">
        <div class="space-y-2">
          <label for="to" class="text-sm font-medium">宛先</label>
          <UiInput
            id="to"
            v-model="email.to"
            type="email"
            placeholder="example@example.com"
            :class="{ 'border-destructive': errors.to.length > 0 }"
          />
          <p v-if="errors.to.length > 0" class="text-sm text-destructive">
            {{ errors.to[0] }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="subject" class="text-sm font-medium">件名</label>
          <UiInput
            id="subject"
            v-model="email.subject"
            type="text"
            placeholder="件名を入力"
            :class="{ 'border-destructive': errors.subject.length > 0 }"
          />
          <p v-if="errors.subject.length > 0" class="text-sm text-destructive">
            {{ errors.subject[0] }}
          </p>
        </div>

        <div class="space-y-2">
          <label for="body" class="text-sm font-medium">本文</label>
          <UiTextarea
            id="body"
            v-model="email.body"
            placeholder="本文を入力"
            rows="10"
            :class="{ 'border-destructive': errors.body.length > 0 }"
          />
          <p v-if="errors.body.length > 0" class="text-sm text-destructive">
            {{ errors.body[0] }}
          </p>
        </div>

        <div class="flex justify-end">
          <UiButton type="submit" :disabled="!isValid || sending" class="w-24">
            <template v-if="sending">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              送信中
            </template>
            <template v-else> 送信 </template>
          </UiButton>
        </div>
      </form>
    </UiCardContent>
  </UiCard>
</template>
