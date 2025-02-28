<script setup lang="ts">
import { RefreshCw, Plus } from "lucide-vue-next";

const refreshEmails = () => {
  // メール更新ロジックをここに実装
  console.log("メールを更新中...");
};

</script>

<template>
  <UiSidebarProvider>
    <AppSidebar @logout="signOut()" />
    <div class="min-h-screen bg-background w-full">
      <header class="border-b sticky inset-0 bg-background">
        <div class="flex h-16 items-center px-4">
          <UiSidebarTrigger />
          <h1 class="ml-4 text-lg font-semibold">OK Mail</h1>
          <div class="ml-auto flex items-center">
            <UiButton variant="ghost" size="icon" @click="refreshEmails">
              <RefreshCw class="h-4 w-4" />
            </UiButton>
            <UiButton variant="ghost" size="icon" as-child>
              <NuxtLink to="/compose">
                <Plus class="h-4 w-4" />
              </NuxtLink>
            </UiButton>
          </div>
        </div>
      </header>

      <main>
        <NuxtPage />
      </main>
    </div>
  </UiSidebarProvider>
</template>
