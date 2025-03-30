<script setup lang="ts">
import { callOnce } from "#imports";
import { User, Trash2, Star } from "lucide-vue-next";

const store = useDraftsStore();

// 初回のメール取得
await callOnce("drafts", store.initialize);
</script>

<template>
  <div>
    <div v-if="store.drafts.length">
      <div
        v-for="draft in store.drafts"
        :key="draft.id"
        class="border-b last:border-0"
      >
        <NuxtLink
          :to="`/compose?draftId=${draft.id}`"
          class="block p-4 transition-colors hover:bg-accent"
        >
          <div class="flex items-center space-x-4">
            <UiAvatar>
              <UiAvatarFallback>
                <User class="h-4 w-4" />
              </UiAvatarFallback>
            </UiAvatar>
            <div class="flex-1 space-y-1">
              <p class="font-medium leading-none">{{ draft.subject }}</p>
              <p class="text-sm text-red-500">下書き</p>
            </div>
            <div class="flex items-center space-x-2">
              <UiButton
                variant="ghost"
                size="icon"
                :title="'ゴミ箱に移動'"
                @click.prevent="store.trash(draft.id)"
              >
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

    <div v-if="store.isPending">
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
      v-if="store.nextPageToken"
      variant="outline"
      class="w-full"
      @click="store.fetchMore"
    >
      もっと見る
    </UiButton>
  </div>
</template>
