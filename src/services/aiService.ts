import type { DeepSeekRequest, AIResponse, LifeStage } from '@/types/story'
import { validateAIResponse } from '@/utils/promptGenerator'

// DeepSeek AI 服务类
export class AIService {
  private apiKey: string
  private baseURL: string = 'https://api.deepseek.com/v1/chat/completions'
  private maxRetries: number = 3
  private timeout: number = 30000 // 30秒超时

  constructor(apiKey?: string) {
    // 优先使用传入的API密钥，否则从环境变量读取
    this.apiKey = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || ''
  }

  // 设置API密钥
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  // 检查API密钥是否设置
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0
  }

  // 获取当前使用的API密钥来源
  getApiKeySource(): string {
    if (import.meta.env.VITE_DEEPSEEK_API_KEY && this.apiKey === import.meta.env.VITE_DEEPSEEK_API_KEY) {
      return '环境变量'
    }
    return '手动设置'
  }

  // 调用DeepSeek API生成故事
  async generateLifeStages(
    systemPrompt: string,
    userPrompt: string,
    retryCount: number = 0
  ): Promise<AIResponse> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: '请先设置DeepSeek API密钥'
      }
    }

    try {
      const requestBody: DeepSeekRequest = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: 'API密钥无效，请检查您的DeepSeek API密钥'
          }
        }
        if (response.status === 429) {
          return {
            success: false,
            error: 'API请求频率过高，请稍后再试'
          }
        }
        return {
          success: false,
          error: `API请求失败: ${response.status} ${response.statusText}`
        }
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return {
          success: false,
          error: 'API返回数据格式错误'
        }
      }

      const content = data.choices[0].message.content
      
      try {
        const parsedContent = JSON.parse(content)
        
        if (!validateAIResponse(parsedContent)) {
          throw new Error('AI返回的数据格式不正确')
        }

        // 为每个阶段添加时间戳
        const stages: LifeStage[] = parsedContent.stages.map((stage: any) => ({
          ...stage,
          timestamp: new Date()
        }))

        return {
          success: true,
          data: stages
        }

      } catch (parseError) {
        return {
          success: false,
          error: 'AI返回的内容无法解析，请重试'
        }
      }

    } catch (error: any) {
      // 网络错误或超时，尝试重试
      if (retryCount < this.maxRetries && 
          (error.name === 'AbortError' || error.name === 'TypeError')) {
        await this.delay(1000 * (retryCount + 1)) // 递增延迟
        return this.generateLifeStages(systemPrompt, userPrompt, retryCount + 1)
      }

      let errorMessage = '生成故事时发生未知错误'
      
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接'
      } else if (error.name === 'TypeError') {
        errorMessage = '网络连接失败，请检查网络设置'
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 测试API连接
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: '请先设置API密钥'
      }
    }

    try {
      const response = await this.generateLifeStages(
        '你是一个测试助手。',
        '请回复：{"stages": [{"age": 1, "title": "测试", "content": "这是一个API连接测试"}]}'
      )
      
      return {
        success: response.success,
        error: response.error
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'API连接测试失败'
      }
    }
  }
}

// 创建全局AI服务实例，自动从环境变量加载API密钥
export const aiService = new AIService()

// 导出便捷函数
export function setApiKey(apiKey: string): void {
  aiService.setApiKey(apiKey)
}

export function hasApiKey(): boolean {
  return aiService.hasApiKey()
}

export async function generateStages(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  return aiService.generateLifeStages(systemPrompt, userPrompt)
}

export async function testApiConnection(): Promise<{ success: boolean; error?: string }> {
  return aiService.testConnection()
}