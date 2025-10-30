# 🎯 模型管理功能说明

## 问题背景

之前的设计存在严重瑕疵：
- ❌ 所有模型都是写死的
- ❌ 用户无法为提供商添加新模型
- ❌ 混淆了"自定义提供商"和"自定义模型"两个概念

## 新的设计方案

### 核心理念
1. **预设模型** - 每个提供商有几个常用的预设模型（不可删除）
2. **自定义模型** - 用户可以为任何提供商添加自定义模型（可删除）
3. **自定义提供商** - 用户可以添加完全自定义的提供商

### 数据结构

```typescript
interface ModelInfo {
  id: string;           // 模型 ID（如：deepseek-chat）
  name: string;         // 模型显示名称（如：DeepSeek Chat）
  isDefault?: boolean;  // 是否为预设模型
}

interface ProviderConfig {
  id: string;                    // 提供商 ID
  name: string;                  // 提供商名称
  apiUrl: string;                // API 地址
  defaultModels: ModelInfo[];    // 预设模型（不可删除）
  customModels: ModelInfo[];     // 用户添加的模型（可删除）
  isCustom?: boolean;            // 是否为自定义提供商
}
```

### 示例配置

```json
{
  "providers": [
    {
      "id": "deepseek",
      "name": "DeepSeek",
      "apiUrl": "https://api.deepseek.com/v1/chat/completions",
      "defaultModels": [
        { "id": "deepseek-chat", "name": "DeepSeek Chat", "isDefault": true },
        { "id": "deepseek-reasoner", "name": "DeepSeek Reasoner", "isDefault": true }
      ],
      "customModels": [
        { "id": "deepseek-v3", "name": "DeepSeek V3" },
        { "id": "deepseek-v3-pro", "name": "DeepSeek V3 Pro" }
      ]
    }
  ]
}
```

---

## 功能说明

### 1. 为预设提供商添加模型

**场景**: DeepSeek 发布了新模型 `deepseek-v3`，用户想使用

**操作步骤**:
1. 打开配置页面 → AI 配置
2. 选择 DeepSeek 提供商
3. 点击"+ 添加模型"按钮
4. 输入模型 ID: `deepseek-v3`
5. 输入模型名称: `DeepSeek V3`（可选）
6. 点击"添加"

**结果**:
- 模型被添加到 DeepSeek 的 `customModels` 列表
- 在模型选择下拉框中显示为"自定义模型"分组
- 可以随时删除

### 2. 为自定义提供商添加模型

**场景**: 用户添加了自己的 API 服务，想添加多个模型

**操作步骤**:
1. 先添加自定义提供商（如果还没有）
2. 选择该提供商
3. 点击"+ 添加模型"
4. 输入模型信息
5. 添加

**结果**:
- 自定义提供商也支持添加多个模型
- 所有模型都可以删除（包括初始模型）

### 3. 删除自定义模型

**场景**: 某个自定义模型不再需要

**操作步骤**:
1. 选择对应的提供商
2. 在"自定义模型列表"中找到要删除的模型
3. 点击"删除"按钮

**结果**:
- 模型从列表中移除
- 如果当前选中的是被删除的模型，自动切换到第一个可用模型

---

## UI 设计

### 配置页面

```
┌─────────────────────────────────────────────┐
│ AI 配置                                      │
├─────────────────────────────────────────────┤
│ 选择供应商: [DeepSeek ▼]                    │
├─────────────────────────────────────────────┤
│ 选择模型:                    [+ 添加模型]   │
│                                              │
│ [下拉框]                                     │
│   预设模型                                   │
│     DeepSeek Chat                            │
│     DeepSeek Reasoner                        │
│   自定义模型                                 │
│     DeepSeek V3                              │
│     DeepSeek V3 Pro                          │
├─────────────────────────────────────────────┤
│ 自定义模型列表:                              │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ DeepSeek V3                    [删除]   │ │
│ │ deepseek-v3                             │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ DeepSeek V3 Pro                [删除]   │ │
│ │ deepseek-v3-pro                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 添加模型表单

```
┌─────────────────────────────────────────────┐
│ 添加模型到 DeepSeek                          │
├─────────────────────────────────────────────┤
│ 模型 ID (必填):                              │
│ [deepseek-v3                              ] │
│                                              │
│ 模型名称 (可选):                             │
│ [DeepSeek V3                              ] │
│                                              │
│ [添加]  [取消]                               │
└─────────────────────────────────────────────┘
```

---

## 技术实现

### 1. 存储结构迁移

```typescript
// 自动迁移旧的 models 结构到新的 defaultModels + customModels
const migrateConfig = async () => {
  const config = await configStorage.get();
  
  if (hasOldStructure(config)) {
    config.aiModel.providers = config.aiModel.providers.map(provider => {
      if ('models' in provider && !('defaultModels' in provider)) {
        return {
          ...provider,
          defaultModels: provider.models,
          customModels: [],
        };
      }
      return provider;
    });
    
    await configStorage.set(config);
  }
};
```

### 2. 获取所有模型

```typescript
// 合并预设模型和自定义模型
const getAllModels = (provider: ProviderConfig): ModelInfo[] => {
  return [...provider.defaultModels, ...provider.customModels];
};
```

### 3. 添加自定义模型

```typescript
const handleAddModel = async (providerId: string, model: ModelInfo) => {
  await configStorage.set(prev => ({
    ...prev,
    aiModel: {
      ...prev.aiModel,
      providers: prev.aiModel.providers.map(p =>
        p.id === providerId
          ? { ...p, customModels: [...p.customModels, model] }
          : p
      ),
    },
  }));
};
```

### 4. 删除自定义模型

```typescript
const handleDeleteModel = async (providerId: string, modelId: string) => {
  await configStorage.set(prev => ({
    ...prev,
    aiModel: {
      ...prev.aiModel,
      providers: prev.aiModel.providers.map(p =>
        p.id === providerId
          ? { ...p, customModels: p.customModels.filter(m => m.id !== modelId) }
          : p
      ),
    },
  }));
};
```

---

## 用户体验优化

### 1. 分组显示

使用 `<optgroup>` 标签分组显示：
- **预设模型** - 提供商官方推荐的模型
- **自定义模型** - 用户自己添加的模型

### 2. 视觉区分

- 预设模型：普通样式
- 自定义模型：带有"可删除"标识

### 3. 智能提示

- 添加模型时提示模型 ID 格式
- 删除模型时确认提示
- 如果删除当前使用的模型，自动切换到其他模型

---

## 常见场景

### 场景 1: DeepSeek 用户

**需求**: DeepSeek 有很多模型，我想添加 V3 系列

**操作**:
1. 选择 DeepSeek 提供商
2. 点击"+ 添加模型"
3. 添加 `deepseek-v3`
4. 添加 `deepseek-v3-pro`
5. 在下拉框中选择使用

### 场景 2: 硅基流动用户

**需求**: 硅基流动支持几十个模型，我想添加 Qwen 系列

**操作**:
1. 选择硅基流动提供商
2. 逐个添加需要的模型：
   - `Qwen/Qwen2.5-72B-Instruct`
   - `Qwen/Qwen2.5-32B-Instruct`
   - `Qwen/Qwen2.5-14B-Instruct`
3. 根据需要切换使用

### 场景 3: OpenRouter 用户

**需求**: OpenRouter 支持上百个模型，我想添加常用的几个

**操作**:
1. 选择 OpenRouter 提供商
2. 添加常用模型：
   - `openai/gpt-4-turbo`
   - `anthropic/claude-3-opus`
   - `google/gemini-pro`
3. 快速切换使用

---

## 优势对比

### 之前的设计

```
❌ 只能使用写死的 2-3 个模型
❌ 新模型发布后无法使用
❌ 无法根据需求定制
❌ 用户体验差
```

### 现在的设计

```
✅ 预设常用模型 + 支持添加任意模型
✅ 新模型发布后立即可用
✅ 完全自由定制
✅ 用户体验优秀
```

---

## 未来扩展

### 1. 模型参数配置

为每个模型配置独立的参数：
```typescript
interface ModelInfo {
  id: string;
  name: string;
  temperature?: number;  // 温度参数
  maxTokens?: number;    // 最大 token 数
  topP?: number;         // Top-P 采样
}
```

### 2. 模型性能统计

记录每个模型的使用情况：
```typescript
interface ModelStats {
  modelId: string;
  usageCount: number;
  avgResponseTime: number;
  successRate: number;
}
```

### 3. 模型推荐

根据用户使用习惯推荐合适的模型：
```typescript
const recommendModels = (userHistory: ModelStats[]) => {
  // 基于使用频率、成功率等推荐
};
```

---

## 总结

新的模型管理功能：
- ✅ 解决了写死模型的问题
- ✅ 区分了"自定义提供商"和"自定义模型"
- ✅ 提供了完全的灵活性
- ✅ 保持了简洁的用户界面
- ✅ 支持未来扩展

**用户现在可以自由添加任何提供商的任何模型！** 🎉
