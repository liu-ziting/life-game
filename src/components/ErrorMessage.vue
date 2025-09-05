<template>
  <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    <div class="flex items-center">
      <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
      </svg>
      <span class="font-medium">{{ title || '错误' }}</span>
    </div>
    <p class="mt-1 text-sm">{{ error }}</p>
    <div v-if="showRetry" class="mt-3">
      <button 
        @click="$emit('retry')"
        class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  error: string | null
  title?: string
  showRetry?: boolean
}

interface Emits {
  retry: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>