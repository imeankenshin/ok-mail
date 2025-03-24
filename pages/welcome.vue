<script setup lang="ts">
import consola from 'consola';
import { signIn } from '~/lib/auth-client';
import { tryCatch } from '~/shared/utils/try-catch';

definePageMeta({
  layout: false,
  middleware: undefined
})

const { $trpc } = useNuxtApp()

onMounted(async () => {
  const {data, error} = await tryCatch($trpc.hello.query({text: "world"}))
  if (error) {
    consola.error(error)
    return
  }
  consola.log(data)
});

</script>

<template>
  <main class="p-3 h-screen grid place-items-center">
    <ClientOnly>
      <UiBlurReveal :delay="0.5" :duration="0.75">
        <h1 class="text-4xl text-center my-4 sm:text-6xl font-bold">OK Mailへようこそ！</h1>
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
      </UiBlurReveal>
    </ClientOnly>
  </main>
</template>
