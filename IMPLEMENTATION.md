# X AI Reply Assistant - 实现说明

## 已完成的功能

### 1. 存储层 (Storage)
✅ 创建了 `configStorage` 用于存储用户配置
- AI 模型配置（支持 6 种模型）
- 自定义语气列表（预设 5 种）
- 回复生成数量（1-5 条）
- 个人语料库

文件位置：`packages/storage/lib/impl/config-storage.ts`

### 2. 配置页面 (Options)
✅ 完整的配置界面，包含 4 个标签页：

#### API 配置
- 选择 AI 模型（OpenAI、OpenRouter、DeepSeek、硅基流动、阿里云百炼、自定义）
- 输入和保存 API Key
- 自定义 API URL 和模型名称

#### 语气管理
- 查看预设语气
- 添加自定义语气
- 删除语气

#### 语料库管理
- 单条添加语料
- 批量上传 .txt 文件
- 删除语料

#### 通用设置
- 设置生成回复数量

文件位置：
- `pages/options/src/Options.tsx`
- `pages/options/src/components/ApiConfig.tsx`
- `pages/options/src/components/ToneManager.tsx`
- `pages/options/src/components/CorpusManager.tsx`
- `pages/options/src/components/GeneralSettings.tsx`

### 3. Content UI (注入到 X 页面)
✅ 实现了完整的用户交互流程：

#### AIButton 组件
- 在回复框聚焦时显示
- 位置自动定位到回复框右下方

#### ToneSelector 组件
- 显示所有可用语气
- 点击选择语气触发 AI 生成

#### ReplyList 组件
- 显示生成的回复列表
- 加载状态动画
- 点击回复自动填充到输入框

文件位置：
- `pages/content-ui/src/matches/twitter/App.tsx`
- `pages/content-ui/src/matches/twitter/components/AIButton.tsx`
- `pages/content-ui/src/matches/twitter/components/ToneSelector.tsx`
- `pages/content-ui/src/matches/twitter/components/ReplyList.tsx`

### 4. Background Service
✅ 实现了 AI API 调用逻辑：
- 支持所有预设模型的 API 调用
- 自动构建 prompt（包含系统提示和用户提示）
- 处理引用帖子的上下文
- 整合用户语料库到 prompt
- 错误处理和响应解析

文件位置：`chrome-extension/src/background/index.ts`

### 5. Manifest 配置
✅ 更新了扩展配置：
- 只在 Twitter/X 页面注入内容脚本
- 移除了不需要的 popup、newtab、devtools、side-panel
- 简化权限为 storage 和 tabs

文件位置：`chrome-extension/manifest.ts`

## 核心工作流程

```
1. 用户在 X 上点击回复按钮
   ↓
2. 回复框聚焦，Content UI 检测到并显示 AI 按钮
   ↓
3. 用户点击 AI 按钮
   ↓
4. 显示语气选择器
   ↓
5. 用户选择语气
   ↓
6. Content UI 提取帖子内容（包括引用）
   ↓
7. 发送消息到 Background Service
   ↓
8. Background 读取配置，构建 prompt
   ↓
9. 调用 AI API
   ↓
10. 解析响应，返回回复列表
    ↓
11. Content UI 显示回复列表
    ↓
12. 用户选择一条回复
    ↓
13. 自动填充到回复框
```

## 特殊功能实现

### 1. 引用帖子处理
在 `App.tsx` 中实现：
```typescript
const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent || '';
const quotedTweet = document.querySelector('[data-testid="quotedTweet"]');
const quotedText = quotedTweet?.querySelector('[data-testid="tweetText"]')?.textContent || '';
setCurrentTweetContent(quotedText ? `${tweetText}\n\n引用: ${quotedText}` : tweetText);
```

### 2. 语料库整合
在 Background Service 中：
```typescript
${config.corpus.length > 0 ? `参考语料（模仿这种表达风格）：\n${config.corpus.slice(0, 5).join('\n')}` : ''}
```
只使用前 5 条语料，避免 prompt 过长。

### 3. 自动填充回复
使用 `document.execCommand` 实现：
```typescript
const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
replyBox.focus();
document.execCommand('insertText', false, reply);
```

## 使用说明

### 安装和运行
```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
```

### 配置步骤
1. 在 Chrome 中加载扩展（`chrome://extensions` → 加载已解压的扩展程序 → 选择 `dist` 目录）
2. 右键点击扩展图标 → 选项
3. 在 "AI 配置" 标签页选择模型并输入 API Key
4. （可选）在 "语气管理" 添加自定义语气
5. （可选）在 "语料库" 上传个人语料

### 使用步骤
1. 打开 X (twitter.com 或 x.com)
2. 点击任意帖子的回复按钮
3. 聚焦回复框，会出现蓝色的 "AI 回复" 按钮
4. 点击按钮，选择语气
5. 等待 AI 生成回复
6. 点击选择一条回复，自动填充到输入框
7. 可以编辑后发送

## API 配置示例

### OpenAI
```
API Key: sk-...
模型: gpt-4o-mini
```

### DeepSeek
```
API Key: sk-...
模型: deepseek-chat
```

### 自定义
```
API URL: https://your-api.com/v1/chat/completions
模型名称: your-model-name
API Key: your-key
```

## 注意事项

1. **API Key 安全**：API Key 存储在 Chrome Storage Local 中，相对安全但不是加密存储
2. **费用控制**：每次生成会调用 AI API，注意控制使用频率
3. **回复长度**：自动过滤超过 280 字符的回复
4. **语料库大小**：建议不超过 100 条，避免 prompt 过长
5. **浏览器兼容性**：目前只支持 Chrome，Firefox 需要额外适配

## 已知限制

1. 只支持文本帖子，图片/视频帖子只能提取文字部分
2. 长推文串（Thread）只能看到当前帖子
3. 回复框的 DOM 选择器可能随 X 更新而变化
4. 不支持多语言切换（界面固定为中文）

## 未来改进方向

1. **增强上下文理解**
   - 提取完整的推文串
   - 分析图片内容（使用 Vision API）
   - 考虑用户的历史回复风格

2. **更多 AI 模型**
   - Claude
   - Gemini
   - 国内其他模型

3. **智能功能**
   - 自动检测帖子语言
   - 情感分析
   - 话题标签建议
   - 表情符号建议

4. **用户体验**
   - 快捷键支持
   - 回复历史记录
   - 收藏常用回复
   - 多语言界面

5. **性能优化**
   - 缓存常用回复
   - 流式输出
   - 请求队列管理

## 故障排查

### AI 按钮不显示
- 检查是否在 twitter.com 或 x.com
- 刷新页面
- 检查控制台是否有错误

### 生成失败
- 检查 API Key 是否正确
- 检查网络连接
- 查看 Background Service 控制台错误

### 回复无法填充
- X 的 DOM 结构可能已更新
- 尝试手动复制粘贴

## 项目文档

详细的功能设计和架构说明请查看 `PROJECT_DOCS.md`
