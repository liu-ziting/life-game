<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 头部 -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-medium text-gray-900">
              人生重开模拟器
            </h1>
           
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span class="ml-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              期待你的无限可能性
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="py-8 px-4">
      <div class="mx-auto">
        <!-- 标题区域 -->
        <div v-if="appState.currentPhase === 'config'" class="text-center mb-8">
          <h2 class="text-3xl font-light text-gray-900 mb-4">15 秒完成角色创建</h2>
          <p class="text-gray-600">为你的角色点击属性，决定 Ta 的人生轨迹</p>
        </div>

        <!-- 配置阶段 -->
        <div v-if="appState.currentPhase === 'config'" class="animate-fade-in max-w-5xl mx-auto">
          <ConfigForm
            :is-submitting="appState.isLoading"
            @config-complete="handleConfigComplete"
          />
        </div>

        <!-- 生成阶段 -->
        <div v-else-if="appState.currentPhase === 'generating'" class="animate-fade-in">
          <div class="bg-white rounded-lg border border-gray-200 p-8">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">正在生成你的人生轨迹...</h3>
              <p class="text-gray-600 mb-6">{{ loadingText }}</p>
              
              <!-- 进度条 -->
              <div v-if="generationProgress !== undefined" class="max-w-sm mx-auto">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>生成进度</span>
                  <span>{{ generationProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gray-900 h-2 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: `${generationProgress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 故事展示阶段 -->
        <div v-else-if="appState.currentPhase === 'story' && appState.lifeStory" class="animate-fade-in">
          <StoryTimeline
            :story="appState.lifeStory"
            :progress="generationProgress"
            @restart="handleRestart"
            @regenerate-stage="handleRegenerateStage"
            @generate-next-stage="handleGenerateNextStage"
          />
        </div>
      </div>
    </main>

    <!-- 错误提示 -->
    <div v-if="appState.error" class="fixed bottom-4 right-4 max-w-sm sm:max-w-md z-50 animate-slide-in-left">
      <ErrorMessage
        :error="appState.error"
        :show-retry="true"
        @retry="handleRetry"
      />
    </div>

    <!-- 页脚 -->
    <footer class="mt-16 py-8 border-t border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <div class="text-gray-400 text-sm">
          <p>由 <span class="text-gray-600 font-medium">flowith AI 100%</span> 的幻觉玻妈AI生成爆</p>
          <p class="mt-1">🎖️ 模型来自 Google 官方支持</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { LifeStory, AppState } from '@/types/story'
import type { UserConfig } from '@/types/user'
import { generateSingleStage, regenerateStage } from '@/services/storyService'
import ConfigForm from '@/components/ConfigForm.vue'
import StoryTimeline from '@/components/StoryTimeline.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

// 应用状态
const appState = reactive<AppState>({
  currentPhase: 'config',
  userConfig: null,
  lifeStory: null,
  isLoading: false,
  error: null
})

// 生成进度
const generationProgress = ref<number | undefined>(undefined)

// 加载文本
const loadingText = computed(() => {
  const texts = [
    '正在分析您的人生配置...',
    '为您编织独特的人生故事...',
    '每个选择都在塑造您的命运...',
    '故事正在一点点展开...',
    '精彩的人生即将呈现...'
  ]
  return texts[Math.floor(Math.random() * texts.length)]
})

// 处理配置完成
async function handleConfigComplete(config: UserConfig, apiKey: string): Promise<void> {
  console.log('接收到配置完成事件:', { config, apiKey })
  
  try {
    appState.error = null
    appState.isLoading = true
    appState.currentPhase = 'generating'
    appState.userConfig = config
    generationProgress.value = 0

    console.log('更新应用状态为生成中...')

    // 初始化故事对象
    appState.lifeStory = {
      userConfig: config,
      stages: [],
      isComplete: false,
      generatedAt: new Date()
    }

    console.log('切换到故事显示模式')
    // 切换到故事显示模式，让StoryTimeline组件开始生成
    appState.currentPhase = 'story'
    appState.isLoading = false

  } catch (error: any) {
    console.error('处理配置完成时发生错误:', error)
    appState.error = error.message || '生成故事时发生错误'
    appState.currentPhase = 'config'
    appState.isLoading = false
  }
}

// 处理生成下一个阶段
async function handleGenerateNextStage(age: number): Promise<void> {
  console.log(`开始生成${age}岁的故事阶段`)
  
  if (!appState.userConfig || !appState.lifeStory) {
    console.log('缺少必要的配置或故事对象')
    return
  }

  try {
    appState.error = null
    
    console.log('调用AI服务生成故事...')
    const result = await generateSingleStage(
      appState.userConfig,
      age,
      appState.lifeStory.stages
    )
    
    console.log('生成结果:', result)

    if (result.success && result.stage) {
      console.log(`成功生成${age}岁的故事:`, result.stage)
      // 添加新生成的阶段
      appState.lifeStory.stages.push(result.stage)
      appState.lifeStory.stages.sort((a, b) => a.age - b.age)
      
      // 检查是否完成所有阶段
      const totalExpectedStages = 18 // AGE_STAGES.length
      if (appState.lifeStory.stages.length >= totalExpectedStages) {
        appState.lifeStory.isComplete = true
        generationProgress.value = 100
        console.log('所有阶段生成完成')
      } else {
        generationProgress.value = Math.round((appState.lifeStory.stages.length / totalExpectedStages) * 100)
        console.log(`当前进度: ${generationProgress.value}%`)
      }
    } else {
      console.error('生成故事失败:', result.error)
      appState.error = result.error || '生成故事阶段失败'
    }
  } catch (error: any) {
    console.error('生成故事时发生异常:', error)
    appState.error = error.message || '生成故事阶段时发生错误'
  }
}

// 处理重新开始
function handleRestart(): void {
  appState.currentPhase = 'config'
  appState.userConfig = null
  appState.lifeStory = null
  appState.error = null
  appState.isLoading = false
  generationProgress.value = undefined
}

// 处理重新生成特定阶段
async function handleRegenerateStage(age: number): Promise<void> {
  if (!appState.userConfig || !appState.lifeStory) return

  try {
    appState.error = null
    
    const result = await regenerateStage(
      appState.userConfig,
      age,
      appState.lifeStory.stages
    )

    if (result.success && result.stage) {
      // 替换对应年龄的阶段
      const index = appState.lifeStory.stages.findIndex(s => s.age === age)
      if (index !== -1) {
        appState.lifeStory.stages[index] = result.stage
      }
    } else {
      appState.error = result.error || '重新生成故事失败'
    }
  } catch (error: any) {
    appState.error = error.message || '重新生成故事时发生错误'
  }
}

// 处理重试
function handleRetry(): void {
  appState.error = null
  if (appState.userConfig) {
    // 重新开始生成
    handleConfigComplete(appState.userConfig, '')
  }
}

// 组件挂载时的初始化
onMounted(() => {
  // 可以在这里添加一些初始化逻辑
  console.log('人生模拟器已启动')
})
</script>
