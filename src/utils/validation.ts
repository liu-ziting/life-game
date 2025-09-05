import type { UserConfig, ValidationError, ValidationResult } from '@/types/user'

// 验证姓名
export function validateName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: '姓名不能为空' }
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: '姓名至少需要2个字符' }
  }
  if (name.trim().length > 20) {
    return { field: 'name', message: '姓名不能超过20个字符' }
  }
  return null
}

// 验证个人描述
export function validateDescription(description: string): ValidationError | null {
  if (!description || description.trim().length === 0) {
    return { field: 'description', message: '个人描述不能为空' }
  }
  if (description.trim().length < 10) {
    return { field: 'description', message: '个人描述至少需要10个字符' }
  }
  if (description.trim().length > 200) {
    return { field: 'description', message: '个人描述不能超过200个字符' }
  }
  return null
}

// 验证属性值（1-10）
export function validateAttribute(value: number, fieldName: string): ValidationError | null {
  if (value < 1 || value > 10) {
    return { field: fieldName, message: `${fieldName}必须在1-10之间` }
  }
  return null
}

// 验证性别
export function validateGender(gender: string): ValidationError | null {
  if (gender !== 'male' && gender !== 'female') {
    return { field: 'gender', message: '请选择性别' }
  }
  return null
}

// 完整的表单验证
export function validateUserConfig(config: Partial<UserConfig>): ValidationResult {
  const errors: ValidationError[] = []

  // 验证姓名
  if (config.name !== undefined) {
    const nameError = validateName(config.name)
    if (nameError) errors.push(nameError)
  } else {
    errors.push({ field: 'name', message: '姓名不能为空' })
  }

  // 验证性别
  if (config.gender !== undefined) {
    const genderError = validateGender(config.gender)
    if (genderError) errors.push(genderError)
  } else {
    errors.push({ field: 'gender', message: '请选择性别' })
  }

  // 验证个人描述
  if (config.description !== undefined) {
    const descriptionError = validateDescription(config.description)
    if (descriptionError) errors.push(descriptionError)
  } else {
    errors.push({ field: 'description', message: '个人描述不能为空' })
  }

  // 验证属性值
  const attributes = [
    { value: config.intelligence, name: '智力' },
    { value: config.wealth, name: '家庭财力' },
    { value: config.appearance, name: '外貌' },
    { value: config.health, name: '健康' }
  ]

  attributes.forEach(attr => {
    if (attr.value !== undefined) {
      const attrError = validateAttribute(attr.value, attr.name)
      if (attrError) errors.push(attrError)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 检查是否为有效的用户配置
export function isValidUserConfig(config: any): config is UserConfig {
  const validation = validateUserConfig(config)
  return validation.isValid
}