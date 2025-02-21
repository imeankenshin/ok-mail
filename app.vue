<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item to="/" title="受信トレイ" prepend-icon="mdi-email" />
        <v-list-item to="/sent" title="送信済み" prepend-icon="mdi-send" />
        <v-list-item to="/drafts" title="下書き" prepend-icon="mdi-file-document-outline" />
        <v-list-item title="ログアウト" prepend-icon="mdi-logout" @click="signOut()" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Gmail Client</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-refresh" @click="refreshEmails" />
      <v-btn icon="mdi-plus" to="/compose" />
    </v-app-bar>

    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(false)

const refreshEmails = () => {
  // メール更新ロジックをここに実装
  console.log('メールを更新中...')
}
</script>
