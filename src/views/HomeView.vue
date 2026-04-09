<script setup lang="ts">
import { ref } from 'vue'
import CozeApi from '../api/cozeApi'
import { cozeConfig } from '../config'

const token = ref('')
const loading = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const emit = defineEmits<{
  (e: 'enter', token: string): void
}>()

// 简单的 Toast 提示逻辑
const showToast = (msg: string, type: 'success' | 'error') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const handleEnter = async () => {
  const tokenStr = token.value.trim()
  if (!tokenStr) return

  // 防止重复点击
  if (loading.value) return
  loading.value = true
  
  try {
    // 1. 设置 token 到全局配置
    cozeConfig.accessToken = tokenStr
    
    // 2. 调用 API 校验该口令是否能成功拉取到 Bot 信息
    await CozeApi.getBotConfig()
    
    // 3. 成功后给出优美的 Toast 提示，并延时跳转让用户看清楚
    showToast('令牌校验成功，正在进入...', 'success')
    setTimeout(() => {
      emit('enter', tokenStr)
    }, 1200)
    
  } catch (error: any) {
    console.error('Bot 校验请求失败:', error)
    // 提示错误并清空无效配置
    showToast('令牌无效或网络错误，请核对', 'error')
    cozeConfig.accessToken = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="home-container">
    
    <!-- 顶部居中浮动的 Toast 通知 -->
    <Transition name="toast-fade">
      <div v-if="toastMessage" :class="['toast', toastType]">
        {{ toastMessage }}
      </div>
    </Transition>

    <h1>欢迎来到 Coze Chat</h1>
    <div class="input-wrapper">
      <input 
        v-model="token" 
        type="text" 
        placeholder="请输入访问令牌 (Access Token)" 
        @keyup.enter="handleEnter"
        :disabled="loading"
      />
      <button @click="handleEnter" :disabled="!token.trim() || loading">
        {{ loading ? '连接验证中...' : '进入对话' }}
      </button>
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
  position: relative;
}

/* Toast 样式 */
.toast {
  position: absolute;
  top: 60px;
  padding: 12px 24px;
  border-radius: 30px;
  color: #fff;
  font-weight: 500;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.toast.success {
  background-color: rgba(16, 185, 129, 0.9); /* 祖母绿 */
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.toast.error {
  background-color: rgba(239, 68, 68, 0.9); /* 宝石红 */
  border: 1px solid rgba(239, 68, 68, 0.4);
}

/* Vue 内置 Transition 动画类 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

h1 {
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
  max-width: 360px;
}

input {
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

input:disabled {
  opacity: 0.6;
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
  min-height: 50px;
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
  transform: translateY(0);
}
</style>
