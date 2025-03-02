<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { tryCatch, tryCatchCallback } from "~/shared/utils/error";

type DraftStatus = "saving" | "saved" | "error" | "idle";

const router = useRouter();
const route = useRoute();
const sending = ref(false);
const draftId = ref<string | null>((route.query.draftId as string) || null);
const draftStatus = ref<DraftStatus>("idle");

const { data: email } = await useFetch(
  `/api/emails/draft/${draftId.value as ":id"}`,
  {
    immediate: !!draftId.value,
    default: () => ({
      to: "",
      subject: "",
      body: "",
    }),
  }
);

// 下書き保存処理
const saveDraft = async () => {
  draftStatus.value = "saving";

  const payload = {
    ...email.value,
    draftId: draftId.value,
  };

  const [response, error] = await tryCatch(() =>
    $fetch("/api/emails/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  );

  if (!error) {
    draftId.value = response.draftId!;
    draftStatus.value = "saved";
  } else {
    draftStatus.value = "error";
  }

  setTimeout(() => {
    draftStatus.value = "idle";
  }, 3000);
};

// 入力内容が変更されたら下書き保存する（デバウンス処理）
const debouncedSaveDraft = useDebounceFn(saveDraft, 1000);

watch(
  email,
  () => {
    debouncedSaveDraft();
  },
  { deep: true }
);

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

        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            <span v-if="draftStatus === 'saving'" class="flex items-center">
              <Loader2 class="mr-1 h-3 w-3 animate-spin" />
              下書き保存中...
            </span>
            <span v-else-if="draftStatus === 'saved'" class="text-green-600">
              下書き保存完了
            </span>
            <span v-else-if="draftStatus === 'error'" class="text-red-600">
              下書き保存エラー
            </span>
          </div>
          <UiButton type="submit" :disabled="sending" class="w-24">
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
