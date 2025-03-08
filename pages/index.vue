<script setup lang="ts">
import { Mail, User, Trash2, Star, Lock } from "lucide-vue-next";

const { data: session, error: sessionError } = await useSession(useFetch);

const store = useEmailsStore();
const [start, isPending] = useAsync();

await callOnce("emails", () => start(store.initialize));
</script>

<template>
  <div>
    <UiAlert v-if="!session">
      <Lock class="size-4" />
      <UiAlertTitle>Gmailとの連携が必要です</UiAlertTitle>
      <UiAlertDescription>
        Gmailとの連携を行うには、Googleアカウントで認証を行なってください。
        <UiButton
          variant="default"
          @click="
            signIn.social({
              provider: 'google',
              callbackURL: '/',
            })
          ">
          <Mail class="mr-2 h-4 w-4" />
          Googleアカウントで認証
        </UiButton>
      </UiAlertDescription>
    </UiAlert>

    <UiAlert v-if="sessionError" variant="destructive">
      <UiAlertTitle>エラー</UiAlertTitle>
      <UiAlertDescription>{{ sessionError }}</UiAlertDescription>
    </UiAlert>

    <div v-else-if="session">
      <div v-if="store.emails.length">
        <div v-for="email in store.emails" :key="email.id" class="border-b last:border-0">
          <NuxtLink
:to="`/emails/${email.id}`" class="block p-4 hover:bg-accent transition-colors"
            :class="{ 'bg-muted': email.isRead }">
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
                <UiButton variant="ghost" size="icon" :title="'ゴミ箱に移動'" @click.prevent="store.moveToTrash(email.id)">
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

      <UiButton v-else-if="store.nextPageToken" variant="outline" class="w-full" @click="start(store.fetchMore)">
        もっと見る
      </UiButton>
    </div>
  </div>
</template>
