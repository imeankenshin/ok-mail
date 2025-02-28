<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const emailId = route.params.id as ":id";

const { data: email, status } = await useFetch(`/api/emails/${emailId}`, {
  lazy: true,
});

const styleSheet = computed(() =>
  email.value?.isHtml && email.value.styleSheet ? email.value.styleSheet : ""
);
useStyleTag(styleSheet);

onMounted(() => {
  setTimeout(async () => {
    await $fetch(`/api/emails/${emailId}/mark-as-read`, {
      method: "POST",
    });
  }, 3000);
});

const contentSkeletonsWidth = [
  "w-24",
  "w-32",
  "w-16",
  "w-8",
  "w-28",
  "w-16",
  "w-24",
  "w-16",
  "w-16",
  "w-16",
  "w-16",
  "w-20",
  "w-28",
  "w-16",
  "w-48",
  "w-8",
  "w-8",
  "w-16",
  "w-8",
  "w-12",
  "w-8",
  "w-16",
  "w-16",
  "w-8",
  "w-16",
  "w-20",
  "w-8",
  "w-16",
  "w-24",
  "w-16",
  "w-36",
  "w-28",
  "w-20",
  "w-16",
  "w-28",
  "w-28",
  "w-12",
  "w-16",
  "w-28",
  "w-24",
  "w-24",
  "w-16",
  "w-24",
  "w-28",
  "w-16",
  "w-24",
  "w-16",
  "w-24",
  "w-12",
  "w-20",
  "w-28",
  "w-28",
  "w-20",
  "w-36",
  "w-16",
  "w-40",
  "w-8",
  "w-12",
  "w-20",
  "w-20",
  "w-20",
  "w-16",
  "w-8",
  "w-8",
  "w-36",
  "w-28",
  "w-24",
  "w-28",
  "w-36",
  "w-24",
  "w-24",
  "w-8",
  "w-28",
  "w-12",
  "w-16",
  "w-20",
  "w-16",
  "w-16",
  "w-24",
  "w-40",
];
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="border-b bg-background px-4 py-3 flex items-center">
      <UiButton variant="ghost" size="icon" class="mr-4" as-child>
        <NuxtLink to="/">
          <ArrowLeft class="h-5 w-5" />
        </NuxtLink>
      </UiButton>
      <h1 class="text-lg font-medium">メール詳細</h1>
    </header>

    <main class="flex-1 p-4">
      <div v-if="status === 'pending'" class="w-full">
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
      </div>

      <div v-else-if="email" class="space-y-4">
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
