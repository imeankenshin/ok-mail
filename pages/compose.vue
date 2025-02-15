<template>
  <v-card>
    <v-card-title>新規メール作成</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="sendEmail">
        <v-text-field
          v-model="email.to"
          label="宛先"
          required
        />
        <v-text-field
          v-model="email.subject"
          label="件名"
          required
        />
        <v-textarea
          v-model="email.body"
          label="本文"
          required
          rows="10"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            type="submit"
            :loading="sending"
          >
            送信
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const sending = ref(false)
const email = ref({
  to: '',
  subject: '',
  body: ''
})

const sendEmail = async () => {
  sending.value = true
  try {
    // ここにGmail APIを使用したメール送信ロジックを実装
    console.log('メールを送信中...', email.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 送信シミュレーション
    router.push('/')
  } catch (error) {
    console.error('メール送信エラー:', error)
  } finally {
    sending.value = false
  }
}
</script>
