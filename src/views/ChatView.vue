<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { botConfig, actionButtons } from '../config'

// 读取配置数据
const botName = ref(botConfig.botName)
const buttons = ref(actionButtons)

// 中间占位：模拟文本返回结果
const placeholderText = ref('在这里显示API的返回结果...\n(目前为占位符，请点击底部按钮测试)')

// 获取并存储视频流
const videoRef = ref<HTMLVideoElement | null>(null)
let mediaStream: MediaStream | null = null

const startCamera = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // 使用前置摄像头
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  } catch (error) {
    console.error('无法访问摄像头:', error)
    alert('请允许浏览器访问摄像头！')
  }
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  // 退出页面时关闭摄像头释放资源
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
})

// 处理底部按钮的点击事件
const handleButtonClick = (payload: string) => {
  console.log('用户将要发送消息:', payload)
  placeholderText.value = `[发送指令]: ${payload}\n---\n这里将展示 Coze API 返回的答案...`
}
</script>

<template>
  <div class="chat-container">
    <!-- 1. 背景层：全屏摄像头 -->
    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      class="camera-view"
    ></video>
    
    <!-- 2. UI 交互层：拆分成上中下结构 -->
    <div class="ui-layer">
      
      <!-- 顶部：智能体名称 (毛玻璃) -->
      <header class="chat-header">
        <h2>{{ botName || '未命名智能体' }}</h2>
      </header>

      <!-- 中间：API 返回结果展示区 (透明黑色占位) -->
      <main class="chat-main">
        <div class="result-box">
          <p>{{ placeholderText }}</p>
        </div>
      </main>

      <!-- 底部：操作按钮存放区 -->
      <footer class="chat-footer">
        <button 
          v-for="btn in buttons" 
          :key="btn.payload" 
          class="action-btn"
          @click="handleButtonClick(btn.payload)"
        >
          {{ btn.label }}
        </button>
      </footer>
      
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
}

/* 摄像头沉底 */
.camera-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* 前置镜像 */
  z-index: 0;
}

/* 交互层遮罩在视频上方，使用 flex 拆发布局 */
.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  pointer-events: none; /* 让空白处点击能穿透到可能的其它元素 */
}

/* 顶部：毛玻璃标题框 */
.chat-header {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.4);            
  backdrop-filter: blur(12px);               
  -webkit-backdrop-filter: blur(12px);       
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto; /* 恢复响应 */
  text-align: center;
}

.chat-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 中间内容区 */
.chat-main {
  flex: 1; /* 占据剩余可用空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  pointer-events: auto; /* 允许滚动 */
}

.result-box {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 20px 24px;
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  text-align: left;
  line-height: 1.5;
  white-space: pre-line; /* 允许文本换行显示 */
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

/* 底部：渐变保护 + 功能按钮 */
.chat-footer {
  padding: 20px 16px 36px 16px; /* 底部多给点内边距适配全面屏底栏 */
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap; /* 放不下时自然换行 */
  pointer-events: auto; 
  /* 底部给个黑色遮罩渐变，保证按钮和背景有对比 */
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
}

.action-btn {
  padding: 12px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1 1 auto;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}
</style>
