<script setup lang="ts">
import { Mail, Send, FileText, LogOut, Star } from "lucide-vue-next";
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
              <UiSidebarMenuButton tooltip="スター付き" as-child>
                <NuxtLink to="/?q=in:starred">
                  <Star class="mr-2 h-4 w-4" />
                  スター付き
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
            <UiSidebarMenuItem>
              <UiSidebarMenuButton tooltip="送信済み" as-child>
                <NuxtLink to="/?q=in:sent">
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
              <UiDialog>
                <UiDialogTrigger as-child>
                  <UiSidebarMenuButton tooltip="ログアウト">
                    <LogOut class="mr-2 h-4 w-4" />
                    ログアウト
                  </UiSidebarMenuButton>
                </UiDialogTrigger>
                <UiDialogContent>
                  <UiDialogHeader>
                    <UiDialogTitle>ログアウト</UiDialogTitle>
                    <UiDialogDescription>
                      本当にログアウトしますか？
                    </UiDialogDescription>
                  </UiDialogHeader>
                  <UiDialogFooter>
                    <UiButton variant="destructive" @click="signOut()">
                      ログアウト
                    </UiButton>
                  </UiDialogFooter>
                </UiDialogContent>
              </UiDialog>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroupContent>
      </UiSidebarGroup>
    </UiSidebarContent>
    <UiSidebarRail />
  </UiSidebar>
</template>
