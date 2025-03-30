<script setup lang="ts">
import { signOut } from "~/lib/auth-client";
import { Plus } from "lucide-vue-next";

const router = useRouter();

const logOut = async () => {
  await signOut();
  router.replace("/welcome");
};
</script>

<template>
  <UiSidebarProvider>
    <AppSidebar @logout="logOut()" />
    <div class="min-h-screen w-full bg-background">
      <header class="sticky inset-0 border-b bg-background">
        <div class="flex h-16 items-center px-4">
          <UiSidebarTrigger />
          <h1 class="ml-4 text-lg font-semibold">OK Mail</h1>
          <div class="ml-auto flex items-center">
            <UiButton variant="ghost" size="icon" as-child>
              <NuxtLink to="/compose">
                <Plus class="h-4 w-4" />
              </NuxtLink>
            </UiButton>
          </div>
        </div>
      </header>

      <main>
        <slot />
      </main>
    </div>
  </UiSidebarProvider>
</template>
