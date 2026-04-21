# Coze Vision Chat - 扣子多模态视觉助手 🚀

![Vue 3](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![Coze](https://img.shields.io/badge/API-Coze.cn-blue?logo=openai&logoColor=white)

这是一个基于 **Vue 3 + TypeScript + Vite** 构建的原生 Web 端多模态对话助手。专为**视觉分析场景**（如辅助解题、试卷分析、实物识别）设计，深度集成了 **Coze (扣子)** API v3 接口。

## ✨ 核心特性

- 📸 **实时视觉接入**：直接调用浏览器摄像头 API，实时预览拍摄画面。
- 🖼️ **多模态交互**：一键截图并自动上传至 Coze 服务器，将图片与指令同步发送给智能体。
- 🧠 **AI 思考展示**：支持实时展示大模型的“思考过程”(Reasoning Content)，让 AI 的逻辑链路清晰可见。
- 🌊 **流式响应 (SSE)**：采用 Server-Sent Events 技术，实现打字机式的极致流畅响应体验。
- 🔄 **对话记忆续接**：自动管理 `conversation_id`，支持多轮对话上下文连续追问。
- 💅 **极致美学设计**：深色模式视觉风格，采用毛玻璃 (Glassmorphism) 毛玻璃特效与流畅的响应式布局。

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **构建工具**: [Vite 8](https://vitejs.dev/)
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式处理**: Vanilla CSS + Glassmorphism 现代美学
- **API 通讯**: 基于原生 `fetch` 实现的 Coze v3 流式集成

## 🚀 快速开始

### 1. 克隆与安装

```bash
# 安装依赖
npm install
# 或者
pnpm install
```

### 2. 配置智能体

打开 `src/config/index.ts` 修改智能体配置：

```typescript
export const botConfig = {
  botName: "你的智能体名称",
  bot_id: "你的智能体ID", 
};
```

### 3. 本地开发

```bash
npm run dev
```

启动后，在欢迎页输入你的 **Coze Access Token** 即可开启视觉对话。

## 📂 项目结构

```text
src/
├── api/             # API 封装，包含 Coze SDK 核心实现及流式解析逻辑
├── assets/          # 静态资源
├── components/      # 通用 UI 组件
├── config/          # 全局配置文件 (Bot ID, Base URL 等)
├── views/           # 页面视图
│   ├── HomeView.vue # 欢迎/令牌入口页
│   └── ChatView.vue # 核心摄像头对话交互页
├── App.vue          # 根组件，简单的视图路由控制
└── main.ts          # 入口文件
```

## 📝 注意事项

- **摄像头权限**：请确保在 HTTPS 环境下或 `localhost` 环境下运行，以获得完整的浏览器摄像头访问权限。
- **跨域配置**：由于浏览器同源策略，生产环境建议通过后端或 Nginx 反向代理 Coze API 接口（`.cn` 域名 API 支持）。
- **多模态能力**：请确保你的 Coze 智能体开启了图片理解能力。

---

💡 *由 Antigravity 辅助生成的 README*
