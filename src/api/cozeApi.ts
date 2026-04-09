import { cozeConfig, botConfig } from '../config'

// 消息内容类型
export type ContentType = 'text' | 'object_string'

// 对话请求参数接口 (移除了原文件中的 botRole，统一使用 config 中唯一的 bot_id)
export interface ChatRequestParams {
  contentType?: ContentType
  content: string
  stream?: boolean
}

// 对话消息接口
interface ChatMessage {
  role: 'user' | 'assistant'
  type: 'question' | 'answer'
  content_type: ContentType
  content: string
}

// Coze 事件基础类型定义
export interface AllCozeEvents {
  event_type: string
  data: any
}

export class CozeApi {
  private static readonly CHAT_ENDPOINT = '/v3/chat'
  private static readonly UPLOAD_ENDPOINT = '/v1/files/upload'
  private static readonly BOT_CONFIG_ENDPOINT = '/v1/bots'

  /**
   * 发送文本消息到 Coze 对话接口
   * @param params 对话请求参数
   * @param conversationId 对话ID（可选）
   * @returns Promise<Response> 返回 fetch Response 对象
   */
  public static async sendTextMessage(params: ChatRequestParams, conversationId?: string | null): Promise<Response> {
    const { content, stream = true } = params
    // 直接使用浏览器原生 crypto 替代 uuid 依赖库
    const userId = crypto.randomUUID()

    if (!botConfig.bot_id) {
      throw new Error(`全局未配置 Bot_id`)
    }

    const message: ChatMessage = {
      role: 'user',
      type: 'question',
      content_type: 'text',
      content: content
    }

    let url = `${cozeConfig.baseURL}${CozeApi.CHAT_ENDPOINT}`
    if (conversationId) {
      url += `?conversation_id=${conversationId}`
    }

    const requestBody = {
      bot_id: botConfig.bot_id,
      user_id: userId,
      stream: stream,
      additional_messages: [message]
    }

    console.log('📤 发送Coze API请求:', { requestBody })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Coze API 请求失败: ${response.status} ${response.statusText}`)
    }

    return response
  }

  /**
   * 发送对象字符串消息 (预留方案，用于图文等多模态提问)
   */
  public static async sendObjectStringMessage(params: ChatRequestParams, conversationId?: string | null): Promise<Response> {
    const { content, stream = true } = params
    const userId = crypto.randomUUID()

    if (!botConfig.bot_id) {
      throw new Error(`全局未配置 Bot_id`)
    }

    const message: ChatMessage = {
      role: 'user',
      type: 'question',
      content_type: 'object_string',
      content: content
    }

    let url = `${cozeConfig.baseURL}${CozeApi.CHAT_ENDPOINT}`
    if (conversationId) {
      url += `?conversation_id=${conversationId}`
    }

    const requestBody = {
      bot_id: botConfig.bot_id,
      user_id: userId,
      stream: stream,
      additional_messages: [message]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Coze API 请求失败: ${response.status} ${response.statusText}`)
    }
    return response
  }

  /**
   * 获取智能体配置信息
   */
  public static async getBotConfig(botId: string = botConfig.bot_id): Promise<any> {
    const url = `${cozeConfig.baseURL}${CozeApi.BOT_CONFIG_ENDPOINT}/${botId}`
    const token = cozeConfig.accessToken
    
    console.log('--- 发起 getBotConfig 请求 ---')
    console.log('🔗 URL:', url)
    console.log('🔑 Token 片段:', token ? token.substring(0, 10) + '...' : '未设置')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('❌ Request Failed - Status:', response.status, response.statusText)
      console.error('❌ Body Detail:', errText)
      throw new Error(`获取智能体配置失败: HTTP Error ${response.status} - ${errText}`)
    }

    const result = await response.json()
    console.log('✅ Response 解析成功:', result)
    
    if (result.code !== 0) {
      console.error('❌ Coze 业务错误码:', result)
      throw new Error(`获取智能体配置失败: [${result.code}] ${result.msg}`)
    }

    return result
  }

  /**
   * 上传文件到 Coze
   */
  public static async uploadFile(file: File): Promise<{ id: string, file_name: string, bytes: number }> {
    const formData = new FormData()
    formData.append('file', file)

    const url = `${cozeConfig.baseURL}${CozeApi.UPLOAD_ENDPOINT}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeConfig.accessToken}`
        // 让浏览器自动填充 multipart/form-data 和 boundary
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`文件上传失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    if (result.code !== 0) {
      throw new Error(`文件上传失败: ${result.msg}`)
    }

    return {
      id: result.data.id,
      file_name: result.data.file_name,
      bytes: result.data.bytes
    }
  }

  /**
   * 处理流式响应，解析 Server-Sent Events 格式
   */
  public static async handleStreamResponse(
    response: Response,
    onMessage: (event: AllCozeEvents) => void
  ): Promise<void> {
    if (!response.body) {
      throw new Error('响应体为空')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const events = chunk.split('\n\n')

        for (const eventBlock of events) {
          if (eventBlock.trim() === '') continue

          let eventType = ''
          let dataStr = ''

          const lines = eventBlock.split('\n')
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim()
            } else if (line.startsWith('data:')) {
              dataStr = line.substring(5).trim()
            }
          }

          if (dataStr === '[DONE]') {
            onMessage({ event_type: 'done', data: '[DONE]' })
            continue
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr)
              const finalEventType = eventType || data.event_type || data.type || 'unknown'

              onMessage({
                event_type: finalEventType,
                data: data
              })
            } catch (error) {
              console.error('解析流式数据失败:', error, dataStr)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export default CozeApi