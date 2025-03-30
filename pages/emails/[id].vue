<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const emailId = route.params.id as ":id";
const key = `email-${emailId}`;

const { $trpc } = useNuxtApp();
const email = useState<Awaited<
  ReturnType<typeof $trpc.emails.find.query>
> | null>(key, () => null);

const styleSheet = computed(() =>
  email.value?.isHtml && email.value.styleSheet ? email.value.styleSheet : "",
);

const timeOutId = ref<ReturnType<typeof setTimeout> | null>(null);
useStyleTag(styleSheet);

// const contentSkeletonsWidth = [
//   "w-24",
//   "w-32",
//   "w-16",
//   "w-8",
//   "w-28",
//   "w-16",
//   "w-24",
//   "w-16",
//   "w-16",
//   "w-16",
//   "w-16",
//   "w-20",
//   "w-28",
//   "w-16",
//   "w-48",
//   "w-8",
//   "w-8",
//   "w-16",
//   "w-8",
//   "w-12",
//   "w-8",
//   "w-16",
//   "w-16",
//   "w-8",
//   "w-16",
//   "w-20",
//   "w-8",
//   "w-16",
//   "w-24",
//   "w-16",
//   "w-36",
//   "w-28",
//   "w-20",
//   "w-16",
//   "w-28",
//   "w-28",
//   "w-12",
//   "w-16",
//   "w-28",
//   "w-24",
//   "w-24",
//   "w-16",
//   "w-24",
//   "w-28",
//   "w-16",
//   "w-24",
//   "w-16",
//   "w-24",
//   "w-12",
//   "w-20",
//   "w-28",
//   "w-28",
//   "w-20",
//   "w-36",
//   "w-16",
//   "w-40",
//   "w-8",
//   "w-12",
//   "w-20",
//   "w-20",
//   "w-20",
//   "w-16",
//   "w-8",
//   "w-8",
//   "w-36",
//   "w-28",
//   "w-24",
//   "w-28",
//   "w-36",
//   "w-24",
//   "w-24",
//   "w-8",
//   "w-28",
//   "w-12",
//   "w-16",
//   "w-20",
//   "w-16",
//   "w-16",
//   "w-24",
//   "w-40",
// ];

watch(email, (email) => {
  if (!email?.isRead)
    timeOutId.value = setTimeout(async () => {
      await $trpc.emails.markAsRead.mutate({
        id: emailId,
      });
    }, 2000);
});

onBeforeUnmount(() => {
  if (timeOutId.value) {
    clearTimeout(timeOutId.value);
  }
});

await callOnce(key, async () => {
  const data = await $trpc.emails.find.query({
    id: emailId,
  });
  email.value = data;
});
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="flex items-center border-b bg-background px-4 py-3">
      <UiButton variant="ghost" size="icon" class="mr-4" as-child>
        <NuxtLink to="/">
          <ArrowLeft class="h-5 w-5" />
        </NuxtLink>
      </UiButton>
      <h1 class="text-lg font-medium">メール詳細</h1>
    </header>

    <main class="flex-1 p-4">
      <!-- <div v-if="status === 'pending'" class="w-full">
        <UiCard>
          <UiCardHeader>
            <UiSkeleton class="h-4 w-full max-w-sm my-0.5" />
            <UiSkeleton class="h-2 w-full max-w-64 my-1" />
            <UiSkeleton class="h-2 w-full max-w-60 my-1" />
            <UiSkeleton class="h-2 w-full max-w-64 my-1" />
          </UiCardHeader>
          <UiSeparator class="my-4" />
          <UiCardContent>
            <div class="flex flex-wrap gap-x-1.5 gap-y-2">
              <UiSkeleton v-for="(className, key) in contentSkeletonsWidth" :key class="h-2.5" :class="className" />
            </div>
          </UiCardContent>
        </UiCard>
      </div> -->

      <div v-if="email" class="space-y-4">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>{{ email.subject }}</UiCardTitle>
            <UiCardDescription>
              <div class="space-y-1 text-sm">
                <div>From: {{ email.from }}</div>
                <div>To: {{ email.to }}</div>
                <div>Date: {{ new Date(email.date).toLocaleString() }}</div>
              </div>
            </UiCardDescription>
          </UiCardHeader>
          <UiSeparator class="my-4" />
          <UiCardContent>
            <div class="___body-wrapper">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                class="___body"
                :lang="email.isHtml ? email.lang : undefined"
                v-html="email.body"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </main>
  </div>
</template>

<style scoped>
.___body-wrapper {
  display: grid;
  place-items: center;
}

.___body * {
  all: revert-layer;
}
</style>
