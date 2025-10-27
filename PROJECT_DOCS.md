# X AI Reply Assistant - 项目文档

## 项目概述

这是一个 Chrome 扩展，帮助用户在 X (Twitter) 上使用 AI 生成智能回复。

## 核心功能

### 1. 智能回复生成
- 当用户在 X 的回复框中聚焦时，显示 AI 助手按钮
- 点击按钮后选择回复语气/人设
- AI 分析当前帖子内容（包括引用帖子）生成多条回复建议
- 用户选择后自动填充到回复框

### 2. 多 AI 模型支持
预设模型：
- OpenAI (GPT-4, GPT-3.5)
- OpenRouter
- 深度求索 (DeepSeek)
- 硅基流动 (SiliconFlow)
- 阿里云百炼
- 自定义 API

### 3. 个性化配置
- 自定义回复语气/人设
- 上传个人语料库
- API 密钥管理
- 回复生成数量设置

## 技术架构

### 目录结构

```
X-AI-reply/
├── packages/
│   └── storage/          # 存储管理（用户配置、API密钥等）
├── pages/
│   ├── options/          # 配置页面（独立 Tab）
│   ├── content-ui/       # 注入到 X 页面的 UI 组件
│   └── content/          # 内容脚本（监听回复框）
└── chrome-extension/
    └── src/
        └── background/   # 后台服务（处理 AI API 请求）
```

### 核心模块

#### 1. Storage (packages/storage)
存储用户配置：
```typescript
interface UserConfig {
  // AI 模型配置
  selectedModel: 'openai' | 'openrouter' | 'deepseek' | 'siliconflow' | 'aliyun' | 'custom';
  apiKeys: {
    openai?: string;
    openrouter?: string;
    deepseek?: string;
    siliconflow?: string;
    aliyun?: string;
    custom?: string;
  };
  customApiUrl?: string;
  
  // 回复配置
  tones: Array<{
    id: string;
    name: string;
    prompt: string;
  }>;
  replyCount: number; // 生成回复数量 (1-5)
  
  // 语料库
  corpus: string[]; // 用户上传的语料
}
```

#### 2. Content Script (pages/content)
- 监听 X 页面的回复框聚焦事件
- 提取当前帖子内容（包括引用帖子）
- 在回复框旁边注入 AI 按钮

#### 3. Content UI (pages/content-ui)
React 组件：
- **AIButton**: 触发按钮
- **ToneSelector**: 语气选择弹窗
- **ReplyList**: 显示生成的回复列表
- **LoadingSpinner**: 加载状态

#### 4. Background Service (chrome-extension/src/background)
- 接收来自 content script 的请求
- 调用 AI API 生成回复
- 处理错误和重试逻辑

#### 5. Options Page (pages/options)
配置页面包含：
- **API 配置**: 选择模型、输入 API 密钥
- **语气管理**: 添加/编辑/删除自定义语气
- **语料库管理**: 上传/删除个人语料
- **通用设置**: 回复数量、快捷键等

## X 页面 DOM 结构分析

### 回复框定位
```javascript
// X 的回复框通常有以下特征：
// 1. contenteditable="true" 的 div
// 2. data-testid="tweetTextarea_0" 或类似
// 3. 父容器有特定的 class

// 示例选择器
const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
const replyContainer = replyBox?.closest('[role="textbox"]');
```

### 帖子内容提取
```javascript
// 主帖子内容
const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent;

// 引用帖子（如果存在）
const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent;
```

## AI Prompt 设计

### 系统 Prompt
```
你是一个 X (Twitter) 回复助手。根据用户选择的语气和提供的帖子内容，生成合适的回复。

要求：
1. 回复要简洁、自然，避免 AI 味道
2. 符合用户选择的语气/人设
3. 如果用户提供了语料库，参考其表达风格
4. 回复长度控制在 280 字符以内
5. 生成 {count} 条不同的回复供用户选择
```

### 用户 Prompt
```
原帖内容：{tweetContent}
{quotedTweetContent ? `引用帖子：${quotedTweetContent}` : ''}

回复语气：{selectedTone}

{corpus.length > 0 ? `参考语料：${corpus.join('\n')}` : ''}

请生成 {replyCount} 条回复。
```

## 数据流

```
用户点击回复框
  ↓
Content Script 监听到 focus 事件
  ↓
注入 AI 按钮到回复框旁边
  ↓
用户点击 AI 按钮
  ↓
显示语气选择器（Content UI）
  ↓
用户选择语气
  ↓
Content Script 提取帖子内容
  ↓
发送消息到 Background Service
  ↓
Background 调用 AI API
  ↓
返回生成的回复列表
  ↓
Content UI 显示回复列表
  ↓
用户选择一条回复
  ↓
自动填充到回复框
```

## 特殊情况处理

### 1. 引用帖子
当帖子包含引用时：
- 提取原帖内容
- 提取引用帖子内容
- 将两者都发送给 AI，提供完整上下文

### 2. 图片/视频帖子
- 如果帖子包含媒体，提取 alt 文本或描述
- 在 prompt 中说明"帖子包含图片/视频"

### 3. 长帖子（Thread）
- 检测是否为 thread
- 提取前几条推文作为上下文

### 4. API 限流
- 实现请求队列
- 显示等待时间
- 提供重试选项

## 安全考虑

1. **API 密钥存储**: 使用 Chrome Storage API 的加密存储
2. **内容安全**: 过滤敏感内容，避免生成不当回复
3. **权限最小化**: 只请求必要的权限（storage, activeTab）
4. **HTTPS**: 所有 API 请求使用 HTTPS

## 开发计划

### Phase 1: 基础功能
- [x] 项目文档
- [ ] Storage 配置
- [ ] Options 页面基础 UI
- [ ] Content Script 注入
- [ ] AI 按钮显示

### Phase 2: AI 集成
- [ ] Background Service API 调用
- [ ] OpenAI 集成
- [ ] 其他模型集成
- [ ] 回复生成和显示

### Phase 3: 高级功能
- [ ] 语料库上传
- [ ] 自定义语气
- [ ] 引用帖子处理
- [ ] 快捷键支持

### Phase 4: 优化
- [ ] 性能优化
- [ ] 错误处理
- [ ] 用户体验改进
- [ ] 国际化支持

## 使用说明

### 安装
1. 克隆项目
2. 运行 `pnpm install`
3. 运行 `pnpm dev`
4. 在 Chrome 中加载 `dist` 目录

### 配置
1. 右键点击扩展图标 → 选项
2. 选择 AI 模型并输入 API 密钥
3. （可选）添加自定义语气
4. （可选）上传个人语料

### 使用
1. 打开 X (Twitter)
2. 点击任意帖子的回复按钮
3. 聚焦回复框，会出现 AI 助手按钮
4. 点击按钮，选择语气
5. 等待 AI 生成回复
6. 选择一条回复，自动填充

## API 文档

### 各模型 API 格式

#### OpenAI
```typescript
POST https://api.openai.com/v1/chat/completions
Headers: {
  "Authorization": "Bearer {apiKey}",
  "Content-Type": "application/json"
}
Body: {
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "n": 3 // 生成数量
}
```

#### DeepSeek
```typescript
POST https://api.deepseek.com/v1/chat/completions
// 格式同 OpenAI
```

#### 其他模型
类似格式，具体参考各平台文档。

## 贡献指南

欢迎提交 Issue 和 PR！

## License

MIT
