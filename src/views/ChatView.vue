<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
})
</script>

<template>
  <div class="chat-container">
    <video 
      ref="videoRef" 
      autoplay 
      playsinline 
      class="camera-view"
    ></video>
  </div>
</template>

<style scoped>
.chat-container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-view {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 让画面填满屏幕 */
  transform: scaleX(-1); /* 前置摄像头常规的镜像效果 */
}
</style>
