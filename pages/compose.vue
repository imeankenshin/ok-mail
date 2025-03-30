<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { tryCatch } from "~/shared/utils/try-catch";

type DraftStatus = "saving" | "saved" | "error" | "idle";

const { $trpc } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const sending = ref(false);
const isEdited = ref(false);
const draftId = ref<string | null>((route.query.draftId as string) || null);
const draftStatus = ref<DraftStatus>("idle");

const { data: draft } = useAsyncData(
  async () => {
    return await $trpc.drafts.find.query({
      draftId: draftId.value!,
    });
  },
  {
    immediate: !!draftId.value,
    default: () => ({
      to: [],
      subject: "",
      body: "",
    }),
  },
);

// メールアドレスの配列を管理
const tags = toRef(draft.value.to || []);
// タグが変更されたときにメールの宛先を更新
watch(
  tags,
  (newTags) => {
    if (draft.value) {
      draft.value.to = newTags.length > 0 ? newTags : [];
    }
  },
  { deep: true },
);

const debounceChangeDraftStatus = useDebounceFn(() => {
  draftStatus.value = "idle";
}, 3000);
// 下書き保存処理
const saveDraft = async () => {
  if (!draft.value) return;
  const payload = {
    ...draft.value,
  };
  const draftIdValue = draftId.value;
  draftStatus.value = "saving";

  if (!draftIdValue) {
    const { data, error } = await tryCatch($trpc.drafts.create.mutate(payload));

    if (error) {
      draftStatus.value = "error";
    } else {
      draftId.value = data.draftId;
      draftStatus.value = "saved";
    }
  } else {
    const { data, error } = await tryCatch(
      $trpc.drafts.update.mutate({
        ...payload,
        draftId: draftIdValue,
      }),
    );

    if (error) {
      draftStatus.value = "error";
    } else {
      draftId.value = data.draftId;
      draftStatus.value = "saved";
    }
  }

  debounceChangeDraftStatus();
};

const debouncedSaveDraft = useDebounceFn(saveDraft, 1000);

watch(
  draft,
  () => {
    isEdited.value = true;
    debouncedSaveDraft();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (!isEdited.value) return;
  debouncedSaveDraft();
});
const sendEmail = async () => {
  const draftIdValue = draftId.value;
  sending.value = true;
  const { error } = await tryCatch<unknown>(
    draftIdValue
      ? $trpc.drafts.send.mutate({
          draftId: draftIdValue,
        })
      : $trpc.emails.send.mutate({
          to: draft.value.to,
          subject: draft.value.subject,
          body: draft.value.body,
        }),
  );

  if (!error) {
    router.push("/");
  }

  sending.value = false;
};
</script>

<template>
  <UiCard class="mx-auto w-full max-w-2xl">
    <UiCardHeader>
      <UiCardTitle>新規メール作成</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <form class="space-y-4" @submit.prevent="sendEmail">
        <div class="space-y-2">
          <label for="to" class="text-sm font-medium">宛先</label>
          <UiTagsInput v-model="tags" required>
            <UiTagsInputItem v-for="tag in tags" :key="tag" :value="tag">
              <UiTagsInputItemText>{{ tag }}</UiTagsInputItemText>
              <UiTagsInputItemDelete />
            </UiTagsInputItem>
            <UiTagsInputInput
              placeholder="メールアドレスを入力してEnterキーを押すか、カンマで区切って複数入力"
            />
          </UiTagsInput>
        </div>

        <div class="space-y-2">
          <label for="subject" class="text-sm font-medium">件名</label>
          <UiInput
            id="subject"
            v-model="draft.subject"
            required
            type="text"
            placeholder="件名を入力"
          />
        </div>

        <div class="space-y-2">
          <label for="body" class="text-sm font-medium">本文</label>
          <UiTextarea
            id="body"
            v-model="draft.body"
            required
            placeholder="本文を入力"
            rows="10"
          />
        </div>

        <div class="flex items-center justify-between">
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
