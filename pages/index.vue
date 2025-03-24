<script setup lang="ts">
import { User, Trash2, Star } from "lucide-vue-next";
import type { Email } from "#shared/types/email";
import { tryCatch } from "#shared/utils/try-catch";

definePageMeta({
  key: route => route.query.q as string
})

const { $trpc } = useNuxtApp()
const route = useRoute()
const q = computed(() => route.query.q as string | undefined)
const emails = useState(`emails-${q.value}`, () => [] as Email[]);
const nextPageToken = useState(`nextPageToken-${q.value}`, (() => undefined as string | undefined))
const [start, isPending] = useAsync();

const fetchMore = async () => {
  if (!nextPageToken.value) return;

  await start(async () => {
    const response = await $trpc.emails.get.query({
      q: q.value,
      pageToken: nextPageToken.value
    });
    emails.value.push(...response.emails);
    nextPageToken.value = response.nextPageToken;
  });
}

const moveToTrash = async (emailId: string) => {
  const previousMails = emails.value;
  emails.value = emails.value.filter((i) => i.id !== emailId);
  const { error } = await tryCatch(
    $trpc.emails.trash.mutate({
      id: emailId
    })
  );
  if (error) {
    emails.value = previousMails;
  }
}

await callOnce(`emails-${q.value}`, async () => {
  const response = await $trpc.emails.get.query({
    q: q.value,
    pageToken: nextPageToken.value
  });
  emails.value = response.emails;
  nextPageToken.value = response.nextPageToken;
});

</script>

<template>
  <div>
    <div v-if="emails.length">
      <div v-for="email in emails" :key="email.id" class="border-b last:border-0">
        <NuxtLink
          :to="`/emails/${email.id}`"
          class="block p-4 hover:bg-accent transition-colors"
          :class="{ 'bg-muted': email.isRead }"
        >
          <div class="flex items-center space-x-4">
            <UiAvatar>
              <UiAvatarFallback>
                <User class="h-4 w-4" />
              </UiAvatarFallback>
            </UiAvatar>
            <div class="flex-1 space-y-1">
              <p class="font-medium leading-none">{{ email.subject }}</p>
              <p class="text-sm text-muted-foreground">{{ email.from }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <UiButton variant="ghost" size="icon" :title="'ゴミ箱に移動'" @click.prevent="moveToTrash(email.id)">
                <Trash2 class="h-4 w-4" />
              </UiButton>
              <UiButton variant="ghost" size="icon">
                <Star class="h-4 w-4" />
              </UiButton>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-if="isPending">
      <div v-for="i in 10" :key="i" class="block p-4">
        <div class="flex items-center space-x-4">
          <UiSkeleton class="size-10 rounded-full" />
          <div class="flex-1">
            <UiSkeleton class="h-4 w-full max-w-sm" />
            <UiSkeleton class="h-5 mt-1 w-full max-w-64" />
          </div>
        </div>
      </div>
    </div>

    <UiButton v-else-if="nextPageToken" variant="outline" class="w-full" @click="start(fetchMore)">
      もっと見る
    </UiButton>
  </div>
</template>
