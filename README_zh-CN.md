# git-commit-tree

[English](./README.md) | 简体中文

![项目预览](https://cdn.picui.cn/vip/2026/01/09/69608d4dc647e.jpg)

一个高性能且可定制的 React 组件，用于以图形方式可视化 git 提交历史，类似于 GitHub 的网络图或 SourceTree。

## 特性

- 🎨 **GitHub 风格设计**: 简洁熟悉的视觉风格，支持分支着色。
- 🚀 **高性能**: 内置虚拟滚动，可流畅处理数千次提交。
- 🌲 **SVG 渲染**: 使用 SVG 进行清晰且可缩放的图形可视化。
- 🖱️ **交互式**: 支持悬停效果、选中支持以及长提交信息的提示框。
- 📏 **响应式**: 自动计算布局宽度并适应容器大小。
- ⚡ **懒加载**: 支持无限滚动/按需加载更多提交。

## 安装

```bash
npm install git-commit-tree
```

## 使用方法

```tsx
import React from 'react';
import { GitCommitTree, Commit } from '@hayrsiane/git-commit-tree';

const App = () => {
  const commits: Commit[] = [
    {
      hash: '9b0c2b6',
      parents: ['a1b2c3d'],
      author: {
        name: 'Alice',
        email: 'alice@example.com',
        timestamp: 1672531200,
      },
      message: '修复解析器中的 bug',
      refs: ['HEAD', 'master'],
    },
    {
      hash: 'a1b2c3d',
      parents: [],
      author: {
        name: 'Bob',
        email: 'bob@example.com',
        timestamp: 1672444800,
      },
      message: '初始提交',
      refs: ['tag: v1.0.0'],
    },
  ];

  const handleLoadMore = async () => {
    // 获取更多提交...
    console.log('加载更多...');
  };

  return (
    <div style={{ height: '600px', border: '1px solid #ccc' }}>
      <GitCommitTree
        commits={commits}
        height="100%" // 虚拟滚动需要容器高度
        rowHeight={60} // 可选：自定义行高
        onLoadMore={handleLoadMore}
        hasMore={false}
      />
    </div>
  );
};

export default App;
```

## 属性 (Props)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `commits` | `Commit[]` | **必填** | 要渲染的提交对象数组。 |
| `width` | `number \| string` | `'100%'` | 容器的宽度。 |
| `height` | `number \| string` | `500` | 容器的高度（对于虚拟滚动至关重要）。 |
| `rowHeight` | `number` | `60` | 每个提交行的高度（像素）。 |
| `graphWidth` | `number` | `undefined` | 手动设置图形区域的宽度。如果未提供，则自动计算。 |
| `onLoadMore` | `() => Promise<void> \| void` | `undefined` | 滚动到底部附近时触发的回调函数。 |
| `hasMore` | `boolean` | `false` | 是否还有更多提交需要加载。 |
| `loading` | `boolean` | `false` | 加载状态指示器。 |
| `threshold` | `number` | `200` | 距离底部多少像素触发 `onLoadMore`。 |

## 类型 (Types)

### Commit

```typescript
interface Commit {
  hash: string;
  parents: string[];
  author: {
    name: string;
    email: string;
    timestamp: number; // Unix 时间戳（秒或毫秒）
  };
  message: string;
  refs?: string[]; // 例如：['HEAD', 'master', 'tag: v1.0.0']
}
```

## 许可证

MIT
