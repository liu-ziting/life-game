import type { UserConfig, LifeStory, LifeStage } from '@/types/story'
import { generateStages } from './aiService'
import { generateUserPrompt, SYSTEM_PROMPT, AGE_STAGES } from '@/utils/promptGenerator'

// 故事生成服务类
export class StoryService {
  // 生成完整的人生故事
  async generateCompleteLifeStory(config: UserConfig): Promise<{
    success: boolean
    story?: LifeStory
    error?: string
    progress?: number
  }> {
    try {
      const story: LifeStory = {
        userConfig: config,
        stages: [],
        isComplete: false,
        generatedAt: new Date()
      }

      // 分批生成故事阶段
      const batchSize = 3 // 每次生成3个阶段
      const totalBatches = Math.ceil(AGE_STAGES.length / batchSize)
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const userPrompt = generateUserPrompt(config, story.stages)
        
        const response = await generateStages(SYSTEM_PROMPT, userPrompt)
        
        if (!response.success || !response.data) {
          return {
            success: false,
            error: response.error || '生成故事失败'
          }
        }

        // 将新生成的阶段添加到故事中
        story.stages.push(...response.data)
        
        // 计算进度
        const progress = Math.round(((batchIndex + 1) / totalBatches) * 100)
        
        // 如果不是最后一批，返回进度信息
        if (batchIndex < totalBatches - 1) {
          return {
            success: true,
            story: { ...story },
            progress
          }
        }
      }

      // 标记故事完成
      story.isComplete = true
      story.stages.sort((a, b) => a.age - b.age) // 按年龄排序

      return {
        success: true,
        story,
        progress: 100
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || '生成故事时发生未知错误'
      }
    }
  }

  // 生成单个故事阶段
  async generateSingleStage(
    config: UserConfig,
    targetAge: number,
    existingStages: LifeStage[] = []
  ): Promise<{
    success: boolean
    stage?: LifeStage
    error?: string
  }> {
    try {
      // 创建针对单个年龄的提示词
      const prompt = this.createSingleStagePrompt(config, targetAge, existingStages)
      const response = await generateStages(SYSTEM_PROMPT, prompt)
      
      if (!response.success || !response.data || response.data.length === 0) {
        return {
          success: false,
          error: response.error || '生成故事阶段失败'
        }
      }

      // 找到匹配目标年龄的阶段，或使用第一个生成的阶段
      const targetStage = response.data.find(stage => stage.age === targetAge) || response.data[0]
      
      // 确保年龄正确
      if (targetStage.age !== targetAge) {
        targetStage.age = targetAge
      }

      return {
        success: true,
        stage: targetStage
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || '生成故事阶段时发生错误'
      }
    }
  }

  // 创建单个阶段的提示词
  private createSingleStagePrompt(
    config: UserConfig,
    targetAge: number,
    existingStages: LifeStage[]
  ): string {
    const genderText = config.gender === 'male' ? '男性' : '女性'
    
    const getAttributeDescription = (value: number) => {
      if (value <= 3) return '较低'
      if (value <= 6) return '中等'
      if (value <= 8) return '较高'
      return '非常高'
    }

    let prompt = `请为以下角色生成${targetAge}岁时的人生故事：

角色信息：
- 姓名：${config.name}
- 性别：${genderText}
- 智力水平：${getAttributeDescription(config.intelligence)} (${config.intelligence}/10)
- 家庭财力：${getAttributeDescription(config.wealth)} (${config.wealth}/10)
- 外貌条件：${getAttributeDescription(config.appearance)} (${config.appearance}/10)
- 健康状况：${getAttributeDescription(config.health)} (${config.health}/10)
- 个人特点：${config.description}

`

    // 如果有历史阶段，添加上下文
    if (existingStages.length > 0) {
      const relevantStages = existingStages
        .filter(stage => stage.age < targetAge)
        .slice(-3) // 只取最近的3个阶段作为上下文
        .sort((a, b) => a.age - b.age)

      if (relevantStages.length > 0) {
        prompt += `历史背景：\n`
        relevantStages.forEach(stage => {
          prompt += `${stage.age}岁 - ${stage.title}\n`
        })
        prompt += `\n`
      }
    }

    prompt += `请生成${targetAge}岁时的人生故事，要求：
1. 故事要体现角色的属性特征
2. 与历史背景保持连贯
3. 内容简洁有力（60-80字）
4. 突出这个年龄的关键事件和转折点
5. 标题要简洁（6-8字）

请只生成一个阶段的故事。`

    return prompt
  }
  async generateStoryBatch(
    config: UserConfig,
    existingStages: LifeStage[] = []
  ): Promise<{
    success: boolean
    stages?: LifeStage[]
    isComplete?: boolean
    error?: string
  }> {
    try {
      const userPrompt = generateUserPrompt(config, existingStages)
      const response = await generateStages(SYSTEM_PROMPT, userPrompt)
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || '生成故事阶段失败'
        }
      }

      // 检查是否完成所有阶段
      const allAges = [...existingStages, ...response.data].map(stage => stage.age)
      const maxAge = Math.max(...allAges)
      const isComplete = maxAge >= AGE_STAGES[AGE_STAGES.length - 1]

      return {
        success: true,
        stages: response.data,
        isComplete
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || '生成故事阶段时发生错误'
      }
    }
  }

  // 重新生成特定年龄的故事
  async regenerateStage(
    config: UserConfig,
    targetAge: number,
    context: LifeStage[]
  ): Promise<{
    success: boolean
    stage?: LifeStage
    error?: string
  }> {
    try {
      // 获取目标年龄之前的阶段作为上下文
      const beforeStages = context.filter(stage => stage.age < targetAge)
      
      const customPrompt = `${generateUserPrompt(config, beforeStages)}

请重新生成${targetAge}岁这个阶段的故事，要求：
1. 与之前的故事保持连贯
2. 内容要有新意，避免重复
3. 体现角色的成长和变化`

      const response = await generateStages(SYSTEM_PROMPT, customPrompt)
      
      if (!response.success || !response.data || response.data.length === 0) {
        return {
          success: false,
          error: response.error || '重新生成故事失败'
        }
      }

      // 返回第一个生成的阶段
      return {
        success: true,
        stage: response.data[0]
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message || '重新生成故事时发生错误'
      }
    }
  }

  // 验证故事完整性
  validateStory(story: LifeStory): {
    isValid: boolean
    missingAges: number[]
    issues: string[]
  } {
    const issues: string[] = []
    const existingAges = story.stages.map(stage => stage.age)
    const missingAges: number[] = []

    // 检查是否缺少关键年龄阶段
    AGE_STAGES.forEach(age => {
      if (!existingAges.includes(age)) {
        missingAges.push(age)
      }
    })

    // 检查故事连贯性
    const sortedStages = [...story.stages].sort((a, b) => a.age - b.age)
    for (let i = 0; i < sortedStages.length - 1; i++) {
      const currentStage = sortedStages[i]
      const nextStage = sortedStages[i + 1]
      
      if (nextStage.age - currentStage.age > 10) {
        issues.push(`${currentStage.age}岁到${nextStage.age}岁之间跨度过大`)
      }
    }

    // 检查内容质量
    story.stages.forEach(stage => {
      if (stage.content.length < 50) {
        issues.push(`${stage.age}岁阶段内容过于简短`)
      }
      if (!stage.title || stage.title.length < 2) {
        issues.push(`${stage.age}岁阶段标题不合适`)
      }
    })

    return {
      isValid: missingAges.length === 0 && issues.length === 0,
      missingAges,
      issues
    }
  }

  // 获取故事统计信息
  getStoryStats(story: LifeStory): {
    totalStages: number
    ageRange: { min: number; max: number }
    averageContentLength: number
    completionPercentage: number
  } {
    const ages = story.stages.map(stage => stage.age)
    const contentLengths = story.stages.map(stage => stage.content.length)
    
    return {
      totalStages: story.stages.length,
      ageRange: {
        min: Math.min(...ages),
        max: Math.max(...ages)
      },
      averageContentLength: contentLengths.reduce((sum, len) => sum + len, 0) / contentLengths.length,
      completionPercentage: Math.round((story.stages.length / AGE_STAGES.length) * 100)
    }
  }
}

// 创建全局故事服务实例
export const storyService = new StoryService()

// 导出便捷函数
export async function generateLifeStory(config: UserConfig) {
  return storyService.generateCompleteLifeStory(config)
}

export async function generateStoryBatch(config: UserConfig, existingStages?: LifeStage[]) {
  return storyService.generateStoryBatch(config, existingStages)
}

export async function generateSingleStage(config: UserConfig, targetAge: number, existingStages?: LifeStage[]) {
  return storyService.generateSingleStage(config, targetAge, existingStages || [])
}

export async function regenerateStage(config: UserConfig, targetAge: number, context: LifeStage[]) {
  return storyService.regenerateStage(config, targetAge, context)
}