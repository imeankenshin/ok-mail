<template>
  <UiSidebarProvider>
    <UiSidebar collapsible="icon">
      <UiSidebarHeader />
      <UiSidebarContent>
        <UiSidebarGroup>
          <UiSidebarGroupContent>
            <UiSidebarMenu>
              <UiSidebarMenuItem>
                <UiSidebarMenuButton as-child>
                  <NuxtLink to="/">
                    <Mail class="mr-2 h-4 w-4" />
                    受信トレイ
                  </NuxtLink>
                </UiSidebarMenuButton>
              </UiSidebarMenuItem>
              <UiSidebarMenuItem>
                <UiSidebarMenuButton as-child>
                  <NuxtLink to="/sent">
                    <Send class="mr-2 h-4 w-4" />
                    送信済み
                  </NuxtLink>
                </UiSidebarMenuButton>
              </UiSidebarMenuItem>
              <UiSidebarMenuItem>
                <UiSidebarMenuButton as-child>
                  <NuxtLink to="/drafts">
                    <FileText class="mr-2 h-4 w-4" />
                    下書き
                  </NuxtLink>
                </UiSidebarMenuButton>
              </UiSidebarMenuItem>
              <UiSidebarMenuItem>
                <UiSidebarMenuButton @click="signOut()">
                  <LogOut class="mr-2 h-4 w-4" />
                  ログアウト
                </UiSidebarMenuButton>
              </UiSidebarMenuItem>
            </UiSidebarMenu>
          </UiSidebarGroupContent>
        </UiSidebarGroup>
      </UiSidebarContent>
      <UiSidebarRail />
    </UiSidebar>
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

      <main class="container py-4">
        <NuxtPage />
      </main>
    </div>
  </UiSidebarProvider>
</template>

<script setup>
import { Mail, Send, FileText, LogOut, RefreshCw, Plus } from "lucide-vue-next";

const refreshEmails = () => {
  // メール更新ロジックをここに実装
  console.log("メールを更新中...");
};
</script>
