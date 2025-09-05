<template>
  <div class="w-full min-h-screen bg-gray-50">
   

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto p-6">
      <!-- 网格布局的人生卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="(ageSlot, index) in ageSlots" 
          :key="ageSlot.age"
          class="w-full"
        >
          <!-- 已生成的故事 -->
          <div v-if="ageSlot.stage" class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow min-h-[200px]">
            <!-- 年龄标题 -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-gray-900">{{ ageSlot.age }}岁</h3>
              <button
                @click="$emit('regenerateStage', ageSlot.age)"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                title="重新生成"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
            
            <h4 class="font-medium text-gray-900 mb-3 text-base">
              {{ ageSlot.stage.title }}
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              {{ ageSlot.stage.content }}
            </p>
          </div>

          <!-- 生成中状态 -->
          <div v-else-if="ageSlot.isLoading" class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
            <!-- 年龄标题 -->
            <div class="w-full flex justify-center mb-4">
              <h3 class="text-2xl font-bold text-gray-900">{{ ageSlot.age }}岁</h3>
            </div>
            
            <svg class="animate-spin h-8 w-8 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 text-sm text-center">正在生成...</p>
          </div>

          <!-- 等待状态 -->
          <div v-else class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
            <!-- 年龄标题 -->
            <div class="w-full flex justify-center mb-4">
              <h3 class="text-2xl font-bold text-gray-900">{{ ageSlot.age }}岁</h3>
            </div>
            
            <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <p class="text-gray-400 text-sm">等待生成</p>
          </div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div v-if="story.isComplete" class="mt-16 text-center">
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">🎉 人生轨迹完成！</h2>
          <p class="text-gray-600 mb-6">
            你的完整人生故事已经生成，共包含 <span class="font-semibold text-blue-600">{{ story.stages.length }}</span> 个精彩阶段
          </p>
          
          <!-- 统计信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-2xl font-bold text-blue-600">{{ story.stages.length }}</div>
              <div class="text-sm text-gray-600">人生阶段</div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-2xl font-bold text-purple-600">{{ maxAge }}</div>
              <div class="text-sm text-gray-600">最高年龄</div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-2xl font-bold text-green-600">{{ averageContentLength }}</div>
              <div class="text-sm text-gray-600">平均字数</div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="text-2xl font-bold text-orange-600">{{ totalWords }}</div>
              <div class="text-sm text-gray-600">总字数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import type { LifeStory } from '@/types/story'
import { AGE_STAGES } from '@/utils/promptGenerator'

interface Props {
  story: LifeStory
  progress?: number
}

interface Emits {
  restart: []
  regenerateStage: [age: number]
  generateNextStage: [age: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const sortedStages = computed(() => {
  return [...props.story.stages].sort((a, b) => a.age - b.age)
})

const userAttributes = computed(() => [
  { key: 'intelligence', label: '智力', value: props.story.userConfig.intelligence, icon: '🧠' },
  { key: 'wealth', label: '财力', value: props.story.userConfig.wealth, icon: '💰' },
  { key: 'appearance', label: '外貌', value: props.story.userConfig.appearance, icon: '✨' },
  { key: 'health', label: '健康', value: props.story.userConfig.health, icon: '💪' }
])

const maxAge = computed(() => {
  if (props.story.stages.length === 0) return 0
  return Math.max(...props.story.stages.map(stage => stage.age))
})

const averageContentLength = computed(() => {
  if (props.story.stages.length === 0) return 0
  const totalLength = props.story.stages.reduce((sum, stage) => sum + stage.content.length, 0)
  return Math.round(totalLength / props.story.stages.length)
})

const totalWords = computed(() => {
  return props.story.stages.reduce((sum, stage) => sum + stage.content.length, 0)
})

const totalStages = computed(() => AGE_STAGES.length)

// 年龄槽位计算，包含加载状态
const ageSlots = computed(() => {
  const stageMap = new Map(props.story.stages.map(stage => [stage.age, stage]))
  const generatedAges = new Set(props.story.stages.map(stage => stage.age))
  
  return AGE_STAGES.map(age => {
    const stage = stageMap.get(age)
    const isLoading = !stage && shouldShowLoading(age, generatedAges)
    
    return {
      age,
      stage,
      isLoading
    }
  })
})

// 判断是否应该显示加载状态
function shouldShowLoading(age: number, generatedAges: Set<number>): boolean {
  // 如果故事已完成，不显示加载
  if (props.story.isComplete) return false
  
  // 找到当前应该生成的下一个年龄
  const sortedGeneratedAges = Array.from(generatedAges).sort((a, b) => a - b)
  const lastGeneratedAge = sortedGeneratedAges[sortedGeneratedAges.length - 1] || -1
  const nextAgeToGenerate = AGE_STAGES.find(stageAge => stageAge > lastGeneratedAge)
  
  return age === nextAgeToGenerate
}

// 监听故事变化，触发下一个阶段的生成
watch(
  () => props.story.stages.length,
  (newLength, oldLength) => {
    if (newLength > oldLength && !props.story.isComplete) {
      // 延迟3秒后生成下一个阶段
      setTimeout(() => {
        const generatedAges = new Set(props.story.stages.map(stage => stage.age))
        const lastGeneratedAge = Math.max(...Array.from(generatedAges))
        const nextAge = AGE_STAGES.find(age => age > lastGeneratedAge)
        
        if (nextAge && !props.story.isComplete) {
          emit('generateNextStage', nextAge)
        }
      }, 3000)
    }
  },
  { immediate: false }
)

// 组件挂载时检查是否需要开始生成
onMounted(() => {
  if (props.story.stages.length === 0 && !props.story.isComplete) {
    // 开始生成第一个阶段
    const firstAge = AGE_STAGES[0]
    if (firstAge !== undefined) {
      emit('generateNextStage', firstAge)
    }
  }
})
</script>

<style scoped>
/* 渐变动画 */
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
</style>