<template>
  <div class="min-h-screen bg-background">
    <Sheet :open="drawer" @update:open="drawer = $event">
      <SheetContent side="left" class="w-64">
        <nav class="space-y-2">
          <NuxtLink to="/" class="flex items-center p-2 hover:bg-accent rounded-lg">
            <Mail class="mr-2 h-4 w-4" />
            <span>受信トレイ</span>
          </NuxtLink>
          <NuxtLink to="/sent" class="flex items-center p-2 hover:bg-accent rounded-lg">
            <Send class="mr-2 h-4 w-4" />
            <span>送信済み</span>
          </NuxtLink>
          <NuxtLink to="/drafts" class="flex items-center p-2 hover:bg-accent rounded-lg">
            <FileText class="mr-2 h-4 w-4" />
            <span>下書き</span>
          </NuxtLink>
          <Button variant="ghost" class="w-full justify-start" @click="signOut()">
            <LogOut class="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </Button>
        </nav>
      </SheetContent>
    </Sheet>

    <header class="border-b">
      <div class="flex h-16 items-center px-4">
        <Button variant="ghost" size="icon" @click="drawer = true">
          <Menu class="h-6 w-6" />
        </Button>
        <h1 class="ml-4 text-lg font-semibold">Gmail Client</h1>
        <div class="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="icon" @click="refreshEmails">
            <RefreshCw class="h-4 w-4" />
          </Button>
          <NuxtLink to="/compose">
            <Button variant="ghost" size="icon">
              <Plus class="h-4 w-4" />
            </Button>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="container py-4">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Mail,
  Send,
  FileText,
  LogOut,
  Menu,
  RefreshCw,
  Plus
} from 'lucide-vue-next'

const drawer = ref(false)

const refreshEmails = () => {
  // メール更新ロジックをここに実装
  console.log('メールを更新中...')
}
</script>
