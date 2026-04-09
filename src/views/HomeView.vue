<script setup lang="ts">
import { ref } from 'vue'

const token = ref('')
const emit = defineEmits<{
  (e: 'enter', token: string): void
}>()

const handleEnter = () => {
  if (token.value.trim()) {
    emit('enter', token.value.trim())
  }
}
</script>

<template>
  <div class="home-container">
    <h1>欢迎来到 Coze Chat</h1>
    <div class="input-wrapper">
      <input 
        v-model="token" 
        type="text" 
        placeholder="请输入令牌" 
        @keyup.enter="handleEnter"
      />
      <button @click="handleEnter" :disabled="!token.trim()">进入对话</button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #1a1a1a;
  color: #fff;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  letter-spacing: 2px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
  box-sizing: border-box;
}

input {
  padding: 15px 20px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #fff;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #646cff;
}

button {
  padding: 15px 20px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: none;
  background-color: #646cff;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, opacity 0.3s;
}

button:hover:not(:disabled) {
  background-color: #535bf2;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
