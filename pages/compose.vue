<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { tryCatchCallback } from "~/shared/utils/error";

const router = useRouter();
const sending = ref(false);

const email = ref({
  to: "",
  subject: "",
  body: "",
});

const isValid = computed(() => {
  return email.value.to && email.value.subject && email.value.body;
});

const sendEmail = async () => {
  sending.value = true;
  const error = await tryCatchCallback(() =>
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
          />
        </div>

        <div class="space-y-2">
          <label for="subject" class="text-sm font-medium">件名</label>
          <UiInput
            id="subject"
            v-model="email.subject"
            type="text"
            placeholder="件名を入力"
          />
        </div>

        <div class="space-y-2">
          <label for="body" class="text-sm font-medium">本文</label>
          <UiTextarea
            id="body"
            v-model="email.body"
            placeholder="本文を入力"
            rows="10"
          />
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
