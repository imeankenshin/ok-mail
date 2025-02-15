<template>
  <div>
    <v-list lines="two">
      <v-list-item
        v-for="email in emails"
        :key="email.id"
        :title="email.subject"
        :subtitle="email.from"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </template>
        
        <template v-slot:append>
          <v-btn
            icon="mdi-star-outline"
            variant="text"
            @click="toggleStar(email)"
          />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// サンプルデータ（後でGmail APIから取得するデータに置き換え）
const emails = ref([
  {
    id: 1,
    subject: 'プロジェクトの進捗について',
    from: 'yamada@example.com',
    starred: false
  },
  {
    id: 2,
    subject: '週次ミーティングの予定',
    from: 'tanaka@example.com',
    starred: false
  }
])

const toggleStar = (email) => {
  email.starred = !email.starred
}
</script>
