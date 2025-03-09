<script setup lang="ts">
import { signIn } from '~/lib/auth-client';

definePageMeta({
  middleware: undefined
})
</script>

<template>
  <div class="p-3 h-screen grid place-items-center">
    <div>
      <h1 class="text-4xl text-center my-4 lg:text-6xl font-bold">OK Mailへようこそ！</h1>
      <p class="text-center text-lg">
        楽しいメール管理体験を、無料で始めましょう。
      </p>
      <div class="w-full flex justify-center mt-8">
        <UiButton
          @click="signIn.social({
            provider: 'google',
            callbackURL: '/',
          })"
        >
          <Icon name="logos:google-icon" />Googleアカウントで始める
        </UiButton>
      </div>
    </div>
  </div>
</template>
