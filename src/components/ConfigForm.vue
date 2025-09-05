<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
   
    <!-- 表单内容 -->
    <div class="p-8 space-y-8">
      <!-- API配置信息提示 -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-green-800 text-sm font-medium">API密钥已配置</span>
        </div>
        <p class="text-green-700 text-xs mt-1">DeepSeek API密钥已从环境配置中加载</p>
        <p class="text-green-600 text-xs mt-1">当前API密钥: {{ apiKeyStatus }}</p>
      </div>

      <!-- 你的名字 -->
      <div class="space-y-3">
        <label class="block text-sm text-gray-700">你的名字</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="输入你的角色名字..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 transition-colors"
          :class="{ 'border-red-300': getFieldError('name') }"
        />
        <p v-if="getFieldError('name')" class="text-red-500 text-xs">
          {{ getFieldError('name') }}
        </p>
      </div>

      <!-- 性别 -->
      <div class="space-y-3">
        <label class="block text-sm text-gray-700">性别</label>
        <div class="flex space-x-3">
          <button
            type="button"
            @click="formData.gender = 'male'"
            class="flex-1 py-3 text-center border rounded-lg transition-colors"
            :class="formData.gender === 'male' ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'"
          >
            男
          </button>
          <button
            type="button"
            @click="formData.gender = 'female'"
            class="flex-1 py-3 text-center border rounded-lg transition-colors"
            :class="formData.gender === 'female' ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'"
          >
            女
          </button>
          <button
            type="button"
            @click="formData.gender = 'other'"
            class="flex-1 py-3 text-center border rounded-lg transition-colors"
            :class="formData.gender === 'other' ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'"
          >
            非二元
          </button>
        </div>
        <p v-if="getFieldError('gender')" class="text-red-500 text-xs">
          {{ getFieldError('gender') }}
        </p>
      </div>

      <!-- 出生地 -->
      <div class="space-y-3">
        <label class="block text-sm text-gray-700">出生地</label>
        <div class="space-y-3">
          <!-- 国内城市 -->
          <div class="flex flex-wrap gap-2">
            <button v-for="city in domesticCities" :key="city" type="button"
                    @click="selectedBirthplace = city"
                    class="px-3 py-1 text-xs border rounded-full transition-colors"
                    :class="selectedBirthplace === city ? 'bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-400'">
              {{ city }}
            </button>
          </div>
          <!-- 国外城市 -->
          <div class="flex flex-wrap gap-2">
            <button v-for="city in internationalCities" :key="city" type="button"
                    @click="selectedBirthplace = city"
                    class="px-3 py-1 text-xs border rounded-full transition-colors"
                    :class="selectedBirthplace === city ? 'bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-400'">
              {{ city }}
            </button>
          </div>
          <!-- 特殊地点 -->
          <div class="flex flex-wrap gap-2">
            <button v-for="place in specialPlaces" :key="place" type="button"
                    @click="selectedBirthplace = place"
                    class="px-3 py-1 text-xs border rounded-full transition-colors"
                    :class="selectedBirthplace === place ? 'bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-400'">
              {{ place }}
            </button>
          </div>
        </div>
      </div>

      <!-- 属性滑块 -->
      <div class="space-y-6">
        <div v-for="attribute in attributes" :key="attribute.key" class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-sm text-gray-700 flex items-center">
              <span class="mr-2">{{ attribute.icon }}</span>
              {{ attribute.label }}
            </label>
            <span class="text-lg font-medium">{{ formData[attribute.key] }}</span>
          </div>
          <div class="relative">
            <input
              v-model.number="formData[attribute.key]"
              type="range"
              min="0"
              max="10"
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-clean"
            />
            <div class="absolute w-3 h-3 bg-black rounded-full top-1/2 transform -translate-y-1/2 pointer-events-none"
                 :style="{ left: `calc(${formData[attribute.key] * 10}% - 6px)` }"></div>
          </div>
        </div>
      </div>

      <!-- 个人描述 -->
      <div class="space-y-3">
        <label class="block text-sm text-gray-700">个人描述</label>
        <textarea
          v-model="formData.description"
          rows="4"
          placeholder="描述一下你的性格特点、兴趣爱好等..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-500 transition-colors"
          :class="{ 'border-red-300': getFieldError('description') }"
        ></textarea>
        <div class="flex justify-between text-xs text-gray-500">
          <span v-if="getFieldError('description')" class="text-red-500">
            {{ getFieldError('description') }}
          </span>
          <span class="ml-auto">{{ formData.description.length }}/200</span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-between pt-6">
        
        <button
          type="submit"
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">生成中...</span>
          <span v-else>重启人生</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { UserConfig, ValidationError } from '@/types/user'
import { validateUserConfig } from '@/utils/validation'
import { hasApiKey } from '@/services/aiService'

interface Props {
  isSubmitting?: boolean
}

interface Emits {
  configComplete: [config: UserConfig, apiKey: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据
const formData = reactive({
  apiKey: '',
  name: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  intelligence: 5,
  wealth: 5,
  appearance: 5,
  health: 5,
  description: ''
})

// 验证错误
const validationErrors = ref<ValidationError[]>([])

// 选中的出生地
const selectedBirthplace = ref('')

// API密钥状态
const apiKeyStatus = computed(() => {
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (envKey && envKey.length > 0) {
    return `${envKey.substring(0, 8)}...${envKey.substring(envKey.length - 4)} (已加载)`
  }
  return '未配置'
})

// 检查API密钥是否可用
const checkApiKey = () => {
  console.log('API密钥检查:', {
    envKey: import.meta.env.VITE_DEEPSEEK_API_KEY ? '存在' : '不存在',
    hasKey: hasApiKey(),
    keyLength: import.meta.env.VITE_DEEPSEEK_API_KEY?.length || 0
  })
}

// 城市数据
const domesticCities = ['自定义', '北京', '上海', '深圳', '香港', '首尔', '釜山', '东京', '大阪', '新加坡', '曼谷']
const internationalCities = ['纽约', '旧金山', '洛杉矶', '拉斯维加斯', '多伦多', '温哥华', '圣保罗', '伦敦', '巴林', '罗马']
const specialPlaces = ['悉尼', '墨尔本', '迪拜', '南极洲', '火星', '亚特兰蒂斯', '雷格沃茨', '木叶村', '新东京', '大都会']

// 属性配置
const attributes = [
  { key: 'intelligence', label: '智力', icon: '🧠' },
  { key: 'wealth', label: '家庭背景', icon: '💰' },
  { key: 'appearance', label: '外貌', icon: '✨' },
  { key: 'health', label: '健康', icon: '💪' }
] as const

// 获取字段错误
function getFieldError(field: string): string | null {
  const error = validationErrors.value.find(err => err.field === field)
  return error ? error.message : null
}

// 处理表单提交
function handleSubmit(): void {
  console.log('开始处理表单提交...')
  
  // 检查API密钥
  checkApiKey()
  
  // 创建用户配置对象
  const userConfig: Partial<UserConfig> = {
    name: formData.name,
    gender: formData.gender as 'male' | 'female',
    intelligence: formData.intelligence,
    wealth: formData.wealth,
    appearance: formData.appearance,
    health: formData.health,
    description: formData.description
  }
  
  console.log('用户配置:', userConfig)

  // 验证表单
  const validation = validateUserConfig(userConfig)
  validationErrors.value = validation.errors
  
  console.log('验证结果:', validation)

  if (validation.isValid) {
    console.log('表单验证成功，发出配置完成事件')
    // 传递空字符串作为API密钥，因为现在从环境变量读取
    emit('configComplete', userConfig as UserConfig, '')
  } else {
    console.log('表单验证失败:', validation.errors)
  }
}

// 组件挂载时检查API密钥
onMounted(() => {
  checkApiKey()
})
</script>

<style scoped>
.slider-clean {
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  outline: none;
}

.slider-clean::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 0;
}

.slider-clean::-moz-range-thumb {
  width: 0;
  height: 0;
  border: none;
  background: transparent;
}
</style>