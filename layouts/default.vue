<script setup lang="ts">
import { signOut } from '~/lib/auth-client';
import { Plus } from 'lucide-vue-next';

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
