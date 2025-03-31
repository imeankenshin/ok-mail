<script setup lang="ts">
import { Trash2, Star } from "lucide-vue-next";
import type { Email } from "#shared/types/email";
import { tryCatch } from "#shared/utils/try-catch";
import { initialed } from "#shared/utils/string";

definePageMeta({
  key: (route) => route.query.q as string,
});

const { $trpc } = useNuxtApp();
const route = useRoute();
const q = computed(() => route.query.q as string | undefined);
const emails = useState(`emails-${q.value}`, () => [] as Email[]);
const nextPageToken = useState(
  `nextPageToken-${q.value}`,
  () => undefined as string | undefined,
);
const { start, isPending } = useAsyncFunction();

const fetchMore = async () => {
  if (!nextPageToken.value) return;

  await start(async () => {
    const response = await $trpc.emails.list.query({
      q: q.value,
      pageToken: nextPageToken.value,
    });
    emails.value.push(...response.emails);
    nextPageToken.value = response.nextPageToken;
  });
};

const moveToTrash = async (emailId: string) => {
  const previousMails = emails.value;
  emails.value = emails.value.filter((i) => i.id !== emailId);
  const { error } = await tryCatch(
    $trpc.emails.trash.mutate({
      id: emailId,
    }),
  );
  if (error) {
    emails.value = previousMails;
  }
};

const markAsStarred = async (emailId: string) => {
  const email = emails.value.find((i) => i.id === emailId);
  if (!email) return;
  const mutation = email.isStarred
    ? $trpc.emails.unstar.mutate
    : $trpc.emails.star.mutate;
  email.isStarred = !email.isStarred;
  const { error } = await tryCatch(
    mutation({
      id: emailId,
    }),
  );
  if (error) {
    email.isStarred = !email.isStarred;
  }
};

await callOnce(`emails-${q.value}`, async () => {
  const response = await $trpc.emails.list.query({
    q: q.value,
    pageToken: nextPageToken.value,
  });
  emails.value = response.emails;
  nextPageToken.value = response.nextPageToken;
});
</script>

<template>
  <div>
    <div v-if="emails.length">
      <div
        v-for="email in emails"
        :key="email.id"
        class="border-b last:border-0"
      >
        <NuxtLink
          :to="`/emails/${email.id}`"
          class="block p-4 transition-colors hover:bg-accent"
          :class="{ 'bg-muted': email.isRead }"
        >
          <div class="flex items-center space-x-4">
            <UiAvatar>
              <!-- Display BIMI logo if available -->
              <UiAvatarImage
                :src="email.bimiLogoUrl ?? ''"
                :alt="email.fromName ?? 'Sender Logo'"
              />
              <!-- Fallback icon -->
              <UiAvatarFallback>
                <span class="text-sm">{{
                  initialed(email.fromName || email.fromEmail)
                }}</span>
              </UiAvatarFallback>
            </UiAvatar>
            <div class="flex-1 space-y-1">
              <p class="font-medium leading-none">{{ email.subject }}</p>
              <p class="text-sm text-muted-foreground">{{ email.fromName || email.fromEmail }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <UiButton
                variant="ghost"
                size="icon"
                :title="'ゴミ箱に移動'"
                @click.prevent="moveToTrash(email.id)"
              >
                <Trash2 class="h-4 w-4" />
              </UiButton>
              <UiButton
                variant="ghost"
                size="icon"
                :title="'星'"
                @click.prevent="markAsStarred(email.id)"
              >
                <Star
                  class="h-4 w-4"
                  :class="{ 'text-yellow-500': email.isStarred }"
                />
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
            <UiSkeleton class="mt-1 h-5 w-full max-w-64" />
          </div>
        </div>
      </div>
    </div>

    <UiButton
      v-else-if="nextPageToken"
      variant="outline"
      class="w-full"
      @click="start(fetchMore)"
    >
      もっと見る
    </UiButton>
  </div>
</template>
