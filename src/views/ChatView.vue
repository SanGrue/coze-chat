<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { botConfig, actionButtons } from '../config'
import CozeApi from '../api/cozeApi'

// 配置文件与状态
const botName = ref(botConfig.botName)
const buttons = ref(actionButtons)

// 对话状态管理
const chatResult = ref('摄像头准备就绪\n等待您的指令...')
const isProcessing = ref(false)
const conversationId = ref<string | null>(null)
const mainScrollRef = ref<HTMLElement | null>(null)

// 摄像头与流控制
const videoRef = ref<HTMLVideoElement | null>(null)
let mediaStream: MediaStream | null = null

const startCamera = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 默认后置摄像头
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
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
})

// 让文字打印时实现自动下拉到底部的效果
const scrollToBottom = () => {
  nextTick(() => {
    if (mainScrollRef.value) {
      mainScrollRef.value.scrollTop = mainScrollRef.value.scrollHeight
    }
  })
}

// 截取视频画面生成 File 对象
const captureScreenshot = async (): Promise<File | null> => {
  if (!videoRef.value) return null
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return null
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], `screenshot_${Date.now()}.jpg`, { type: 'image/jpeg' }))
      } else {
        reject(new Error('Canvas 转 Blob 失败'))
      }
    }, 'image/jpeg', 0.8) // 画面压缩控制
  })
}

// 处理点击发送业务核心流程
const handleButtonClick = async (payload: string) => {
  // 防抖，如果正在请求中则不响应
  if (isProcessing.value) return
  isProcessing.value = true
  
  chatResult.value = `📸 正在捕获试卷画面...\n指令: ${payload}`

  try {
    // 第一步：截取画面并打包成 File
    const file = await captureScreenshot()
    if (!file) throw new Error('截图失败，请确保摄像头画面正常展示中')
    
    // 第二步：上传文件至 Coze 获取资源 ID
    chatResult.value += '\n☁️ 上传试卷图片至 Coze 服务器中...'
    scrollToBottom()
    const uploadRes = await CozeApi.uploadFile(file)
    const fileId = uploadRes.id
    
    // 第三步：向智能体发送多模态消息（图片对象 + 文本提示词）
    chatResult.value += '\n🤖 文件上传成功！开始等待智能体推理并回复...'
    scrollToBottom()
    
    const contentArray = [
      { type: "text", text: payload },
      { type: "image", file_id: fileId }
    ]
    // 强制按数组结构的字符串发送给大模型
    const contentString = JSON.stringify(contentArray)

    // 调用 sendObjectStringMessage 并在参数附加上文会话 ID（如果存在）
    const response = await CozeApi.sendObjectStringMessage(
      { content: contentString, stream: true }, 
      conversationId.value
    )

    // 清空占位提示，准备流式打字机接听数据
    chatResult.value = ''

    // 第四步：解流 (Server-Sent Events) 并展示增量结果
    await CozeApi.handleStreamResponse(response, (event) => {
      
      // 捕获新对话或者已建立的 conversation_id 并保存，作为本次和下次继续关联记忆的凭证
      if (event.event_type === 'conversation.chat.created' && event.data?.conversation_id) {
        conversationId.value = event.data.conversation_id
      }
      
      // 提取流式输出的新文本段落并累加
      if (event.event_type === 'conversation.message.delta' && event.data?.content) {
        chatResult.value += event.data.content
        scrollToBottom()
      }
      
      // 如果出现中止或错误提前响应错误
      if (event.event_type === 'conversation.chat.failed') {
        chatResult.value += '\n\n[回答过程发生内部失败或网络阻断]'
        scrollToBottom()
      }
    })

  } catch (error: any) {
    console.error('业务流程发生异常:', error)
    chatResult.value += `\n\n❌ [发生错误]: ${error.message || '网络连接或发生未知错误'}`
    scrollToBottom()
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="chat-container">
    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      class="camera-view"
    ></video>
    
    <div class="ui-layer">
      <!-- 头部：显示是否具有记忆 ID 以及智能体名称 -->
      <header class="chat-header">
        <h2>{{ botName || '未命名智能体' }}</h2>
        <div class="badge" v-if="conversationId">已续接上下文</div>
      </header>

      <!-- 内容区：增加 ref 挂载以控制它的滚动条 -->
      <main class="chat-main" ref="mainScrollRef">
        <div class="result-box">
          <p>{{ chatResult }}</p>
        </div>
      </main>

      <footer class="chat-footer">
        <button 
          v-for="btn in buttons" 
          :key="btn.payload" 
          class="action-btn"
          :class="{ disabled: isProcessing }"
          :disabled="isProcessing"
          @click="handleButtonClick(btn.payload)"
        >
          {{ isProcessing ? '处理中...' : btn.label }}
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

.camera-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.chat-header {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.4);            
  backdrop-filter: blur(12px);               
  -webkit-backdrop-filter: blur(12px);       
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.chat-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.badge {
  font-size: 0.75rem;
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  pointer-events: auto;
  scroll-behavior: smooth;
}

.result-box {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 20px 24px;
  border-radius: 16px;
  color: #fff;
  font-size: 1.05rem;
  text-align: left;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  width: 100%;
  max-height: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.chat-footer {
  padding: 20px 16px 36px 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  pointer-events: auto; 
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
}

.action-btn {
  padding: 12px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1 1 auto;
  max-width: 180px; /* 防止过宽 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.35);
}

.action-btn:active:not(.disabled) {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.4);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
}
</style>
