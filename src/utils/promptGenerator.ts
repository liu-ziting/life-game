import type { UserConfig, PromptTemplate } from '@/types/story'

// 年龄阶段定义
export const AGE_STAGES = [0, 5, 10, 15, 18, 22, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]

// 系统提示词
export const SYSTEM_PROMPT = `你是一个专业的人生故事生成器。请根据用户提供的个人信息，生成一个真实、有趣且连贯的人生故事。

要求：
1. 故事需要真实可信，符合常理
2. 每个年龄阶段都要体现用户的属性特点（智力、财力、外貌、健康）
3. 故事情节要有起伏，既有成功也有挫折
4. 保持角色的一致性和故事的连贯性
5. 语言简洁有力，重点突出关键事件
6. 每个阶段内容控制在60-80字，突出核心转折点

请严格按照以下JSON格式返回：
{
  "stages": [
    {
      "age": 年龄数字,
      "title": "简洁的阶段标题（6-8字）",
      "content": "简洁的故事内容，60-80字，突出关键事件和转折点"
    }
  ]
}`

// 生成用户提示词
export function generateUserPrompt(config: UserConfig, currentStages: any[] = []): string {
  const genderText = config.gender === 'male' ? '男性' : '女性'
  
  // 属性描述映射
  const getAttributeDescription = (value: number) => {
    if (value <= 3) return '较低'
    if (value <= 6) return '中等'
    if (value <= 8) return '较高'
    return '非常高'
  }

  let prompt = `请为以下角色生成人生故事：

角色信息：
- 姓名：${config.name}
- 性别：${genderText}
- 智力水平：${getAttributeDescription(config.intelligence)} (${config.intelligence}/10)
- 家庭财力：${getAttributeDescription(config.wealth)} (${config.wealth}/10)
- 外貌条件：${getAttributeDescription(config.appearance)} (${config.appearance}/10)
- 健康状况：${getAttributeDescription(config.health)} (${config.health}/10)
- 个人特点：${config.description}

`

  // 如果已有阶段，添加历史信息以保持连贯性
  if (currentStages.length > 0) {
    prompt += `已有故事情节：\n`
    currentStages.forEach(stage => {
      prompt += `${stage.age}岁 - ${stage.title}：${stage.content.substring(0, 100)}...\n`
    })
    prompt += `\n请基于以上情节继续生成后续的人生阶段，保持故事的连贯性。\n\n`
  }

  const nextAges = AGE_STAGES.filter(age => age > (currentStages[currentStages.length - 1]?.age || -1))
  const targetAges = nextAges.slice(0, 3) // 每次生成3个阶段

  prompt += `请生成以下年龄阶段的故事：${targetAges.join('、')}岁

请确保：
1. 每个阶段都要体现角色的属性特征
2. 故事情节要合理且有趣
3. 保持与之前阶段的连贯性
4. 每个阶段的故事内容简洁有力（60-80字），突出关键事件和人生转折点`

  return prompt
}

// 创建完整的提示词模板
export function createPromptTemplate(): PromptTemplate {
  return {
    systemPrompt: SYSTEM_PROMPT,
    userPromptTemplate: '',
    ageStages: AGE_STAGES
  }
}

// 验证AI返回的内容格式
export function validateAIResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false
  }

  if (!Array.isArray(response.stages)) {
    return false
  }

  return response.stages.every((stage: any) => {
    return (
      typeof stage.age === 'number' &&
      typeof stage.title === 'string' &&
      typeof stage.content === 'string' &&
      stage.title.length > 0 &&
      stage.content.length > 20 // 确保内容足够简洁有效
    )
  })
}

// 格式化属性值为描述文本
export function formatAttributeDescription(value: number): string {
  if (value <= 2) return '很低'
  if (value <= 4) return '较低'
  if (value <= 6) return '中等'
  if (value <= 8) return '较高'
  return '很高'
}