<script setup lang="ts">
import { Mail, Send, FileText, LogOut } from "lucide-vue-next";
const emit = defineEmits(["logout"]);

const signOut = () => {
  emit("logout");
};
</script>

<template>
  <UiSidebar collapsible="icon">
    <UiSidebarHeader />
    <UiSidebarContent>
      <UiSidebarGroup>
        <UiSidebarGroupContent>
          <UiSidebarMenu>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton tooltip="受信トレイ" as-child>
                <NuxtLink to="/">
                  <Mail class="mr-2 h-4 w-4" />
                  受信トレイ
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton tooltip="送信済み" as-child>
                <NuxtLink to="/sent">
                  <Send class="mr-2 h-4 w-4" />
                  送信済み
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton tooltip="下書き" as-child>
                <NuxtLink to="/drafts">
                  <FileText class="mr-2 h-4 w-4" />
                  下書き
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton tooltip="ログアウト" @click="signOut()">
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
</template>
