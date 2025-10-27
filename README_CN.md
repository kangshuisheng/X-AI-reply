# X AI Reply Assistant

一个智能的 Chrome 扩展，帮助你在 X (Twitter) 上使用 AI 生成个性化回复。

## ✨ 核心功能

### 🤖 智能回复生成
- 在 X 的回复框中一键调用 AI 助手
- 根据帖子内容自动生成多条回复建议
- 支持引用帖子的上下文理解
- 点击即可自动填充到回复框

### 🎭 多种回复语气
预设 5 种常用语气：
- 专业 - 正式、严谨的商务风格
- 友好 - 亲切、温暖的交流方式
- 幽默 - 轻松、有趣的表达
- 支持 - 鼓励、积极的态度
- 提问 - 探讨、深入的交流

支持自定义语气，打造专属人设！

### 🔧 多 AI 模型支持
内置 6 种主流 AI 模型：
- **OpenAI** (GPT-4, GPT-3.5)
- **OpenRouter** - 多模型聚合平台
- **深度求索 (DeepSeek)** - 国产高性能模型
- **硅基流动 (SiliconFlow)** - 高性价比选择
- **阿里云百炼** - 企业级服务
- **自定义** - 支持任何兼容 OpenAI 格式的 API

### 📚 个人语料库
- 上传你的日常表达方式
- AI 学习你的说话风格
- 生成更自然、更像你的回复
- 避免 AI 味道过重

## 🚀 快速开始

### 安装

```bash
# 1. 克隆项目
git clone https://github.com/your-username/X-AI-reply.git
cd X-AI-reply

# 2. 安装依赖
pnpm install

# 3. 开发模式运行
pnpm dev

# 4. 在 Chrome 中加载扩展
# 打开 chrome://extensions
# 开启"开发者模式"
# 点击"加载已解压的扩展程序"
# 选择项目的 dist 目录
```

### 配置

1. **设置 API Key**
   - 右键点击扩展图标 → 选项
   - 选择你要使用的 AI 模型
   - 输入对应的 API Key
   - 点击保存

2. **自定义语气**（可选）
   - 切换到"语气管理"标签
   - 点击"+ 添加语气"
   - 输入语气名称和提示词
   - 保存

3. **上传语料库**（可选）
   - 切换到"语料库"标签
   - 单条添加或批量上传 .txt 文件
   - 每行一条你的常用表达

### 使用

1. 打开 [X (Twitter)](https://x.com)
2. 点击任意帖子的回复按钮
3. 聚焦回复框，右下角会出现蓝色的 **"AI 回复"** 按钮
4. 点击按钮，选择回复语气
5. 等待 AI 生成回复（通常 2-5 秒）
6. 从列表中选择一条回复
7. 回复自动填充到输入框，可以编辑后发送

## 📸 截图

### 配置页面
![Options Page](docs/screenshots/options.png)

### AI 按钮
![AI Button](docs/screenshots/ai-button.png)

### 语气选择
![Tone Selector](docs/screenshots/tone-selector.png)

### 回复列表
![Reply List](docs/screenshots/reply-list.png)

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Vite** - 构建工具
- **Chrome Extension Manifest V3** - 扩展标准
- **Turborepo** - 单体仓库管理

## 📁 项目结构

```
X-AI-reply/
├── packages/
│   └── storage/              # 存储管理
│       └── lib/impl/
│           └── config-storage.ts  # 用户配置存储
├── pages/
│   ├── options/              # 配置页面
│   │   └── src/
│   │       ├── Options.tsx
│   │       └── components/   # 配置组件
│   └── content-ui/           # 注入到 X 的 UI
│       └── src/matches/twitter/
│           ├── App.tsx
│           └── components/   # AI 按钮、语气选择器等
└── chrome-extension/
    └── src/background/       # 后台服务（AI API 调用）
```

## 🔐 隐私和安全

- ✅ API Key 存储在本地 Chrome Storage
- ✅ 不收集任何用户数据
- ✅ 所有 AI 请求直接发送到你选择的服务商
- ✅ 开源代码，可审计

## 💡 高级功能

### 引用帖子处理
自动识别引用帖子，将原帖和引用内容一起发送给 AI，提供完整上下文。

### 智能过滤
- 自动过滤超过 280 字符的回复
- 移除空白和无效内容
- 确保回复符合 X 的限制

### 语料库智能采样
只使用前 5 条语料，避免 prompt 过长，保持生成速度。

## 🐛 故障排查

### AI 按钮不显示
- 确保在 twitter.com 或 x.com 页面
- 刷新页面重试
- 检查扩展是否已启用

### 生成失败
- 检查 API Key 是否正确
- 确认网络连接正常
- 查看是否超出 API 配额
- 打开扩展的 Service Worker 查看错误日志

### 回复无法填充
- X 的页面结构可能已更新
- 尝试手动复制粘贴回复内容
- 提交 Issue 反馈问题

## 🗺️ 开发计划

- [ ] 支持图片内容分析（Vision API）
- [ ] 提取完整推文串作为上下文
- [ ] 添加更多 AI 模型（Claude, Gemini）
- [ ] 快捷键支持
- [ ] 回复历史记录
- [ ] 多语言界面
- [ ] 流式输出
- [ ] 情感分析
- [ ] 话题标签建议

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

本项目基于 [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 模板开发。

## 📚 相关文档

- [项目设计文档](PROJECT_DOCS.md)
- [实现说明](IMPLEMENTATION.md)
- [原始模板 README](README.md)

---

如果这个项目对你有帮助，请给个 ⭐️ Star！
