<script setup lang="ts">
import { ref } from 'vue'
import HomeView from './views/HomeView.vue'
import ChatView from './views/ChatView.vue'

// 控制当前展示的视图: 'home' | 'chat'
const currentView = ref<'home' | 'chat'>('home')

// 存储用户输入的令牌
const accessToken = ref('')

const handleEnter = (token: string) => {
  accessToken.value = token
  currentView.value = 'chat'
}
</script>

<template>
  <HomeView v-if="currentView === 'home'" @enter="handleEnter" />
  <ChatView v-else />
</template>
