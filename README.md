# 人生轨迹生成器

一个基于Vue3 + TypeScript + TailwindCSS的人生模拟器，使用DeepSeek AI生成个性化人生故事。

## 环境配置

### 1. API密钥配置

项目使用DeepSeek AI API，需要配置API密钥：

1. 复制环境配置模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入您的DeepSeek API密钥：
```bash
VITE_DEEPSEEK_API_KEY=your_actual_api_key_here
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行开发服务器

```bash
npm run dev
```

## 功能特性

- 🎯 **个性化配置**: 设置角色属性（智力、财力、外貌、健康）
- 🎨 **网格布局**: 4列网格展示人生阶段，虚线连接营造流程感
- ⚡ **逐个生成**: 每3秒生成一个人生阶段，提供实时反馈
- 📱 **响应式设计**: 支持PC和移动端，自动适配布局
- 🔄 **重新生成**: 可单独重新生成任意人生阶段

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **样式框架**: TailwindCSS v3.4.0
- **构建工具**: Vite
- **AI服务**: DeepSeek AI API
- **状态管理**: Vue 3 Composition API (reactive/ref)

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── ConfigForm.vue  # 角色配置表单
│   └── StoryTimeline.vue # 人生轨迹展示
├── services/           # 服务层
│   ├── aiService.ts    # AI API调用
│   └── storyService.ts # 故事生成逻辑
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── assets/             # 静态资源
```

## 安全说明

- ✅ API密钥通过环境变量管理，不会提交到代码库
- ✅ 生产环境和开发环境分离配置
- ✅ 敏感信息已加入.gitignore

## 开发说明

1. 环境变量以 `VITE_` 前缀命名，Vite会自动注入到客户端
2. API密钥优先从环境变量读取，支持运行时覆盖
3. 所有API调用都有错误处理和重试机制
4. 代码遵循TypeScript严格模式，提供完整类型注释