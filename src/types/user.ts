// 用户配置接口
export interface UserConfig {
  name: string // 姓名
  gender: 'male' | 'female' // 性别
  intelligence: number // 智力 (1-10)
  wealth: number // 家庭财力 (1-10)
  appearance: number // 外貌 (1-10)
  health: number // 健康 (1-10)
  description: string // 个人描述
}

// 表单验证错误
export interface ValidationError {
  field: string
  message: string
}

// 表单验证结果
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}