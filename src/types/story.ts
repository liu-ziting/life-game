import type { UserConfig } from './user'

// 故事阶段接口
export interface LifeStage {
  age: number // 年龄
  title: string // 阶段标题
  content: string // 故事内容
  timestamp: Date // 生成时间
}

// 完整的人生故事
export interface LifeStory {
  userConfig: UserConfig
  stages: LifeStage[]
  isComplete: boolean
  generatedAt: Date
}

// 应用状态管理
export interface AppState {
  currentPhase: 'config' | 'generating' | 'story'
  userConfig: UserConfig | null
  lifeStory: LifeStory | null
  isLoading: boolean
  error: string | null
}

// AI 提示词模板
export interface PromptTemplate {
  systemPrompt: string
  userPromptTemplate: string
  ageStages: number[]
}

// AI API 响应
export interface AIResponse {
  success: boolean
  data?: LifeStage[]
  error?: string
}

// DeepSeek API 请求
export interface DeepSeekRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}