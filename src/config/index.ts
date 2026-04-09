// src/config/index.ts

export const cozeConfig = {
  baseURL: "https://api.coze.cn", // 理工开源扣子地址
  accessToken: "",                // Coze API 访问令牌（初始为空，由欢迎页输入框赋值）
};

export const botConfig = {
  botName: "理工学院考试助手", // 智能体名称（暂时留空）
  bot_id: "7626416081858707497",  // 智能体 ID（暂时留空）
};

// 底部预设的发送指令按钮配置
export const actionButtons = [
  { label: "回答单选题", payload: "回答单选题" },
  { label: "回答多选题", payload: "回答多选题" },
  { label: "回答判断题", payload: "回答判断题" }
];