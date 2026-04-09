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
  padding: 0 24px;
  box-sizing: border-box;
}

h1 {
  /* 使用 clamp 函数实现响应式字体，手机端为 1.75rem（约 28px），并在大屏逐渐变大到 2.5rem */
  font-size: clamp(1.75rem, 6vw, 2.5rem);
  margin-bottom: 2.5rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-align: center;
  line-height: 1.3;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 360px; /* 在大屏上也保持一个紧凑合适的比例，手机端自然填满宽度 */
}

input {
  /* 移动端 iOS 至少需要 16px(1rem) 字体大小，防止聚焦时屏幕自动缩放 */
  padding: 14px 18px;
  font-size: 1rem;
  border-radius: 12px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #fff;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

input::placeholder {
  color: #888;
}

input:focus {
  border-color: #646cff;
  box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
}

button {
  padding: 14px 18px;
  font-size: 1.05rem;
  border-radius: 12px;
  border: none;
  background-color: #646cff;
  color: white;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-height: 50px; /* 确保移动端触控区域高度充足，手感更好 */
}

button:hover:not(:disabled) {
  background-color: #535bf2;
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
