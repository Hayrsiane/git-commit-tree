# Git Commit Tree 组件开发文档

本文档详细介绍了 `@hayrsiane/git-commit-tree` 组件的开发流程、技术架构以及核心算法实现。

## 1. 项目初始化

一切从零开始，我们首先初始化一个标准的 npm 项目，并安装必要的依赖。

### 1.1 初始化 package.json

```bash
mkdir git-commit-tree
cd git-commit-tree
npm init -y
```

### 1.2 安装核心依赖

我们需要 React 全家桶以及 TypeScript 支持。由于是开发组件库，我们将 React 设为 `peerDependencies`，但在开发环境中我们需要安装它。

```bash
# 安装开发依赖
npm install -D typescript @types/react @types/react-dom react react-dom

# 安装构建工具 tsup
npm install -D tsup

# 安装 Demo 开发环境工具 vite
npm install -D vite @vitejs/plugin-react
```

### 1.3 配置构建工具 (tsup)

为了构建出既支持 ESM 又支持 CJS 的包，我选择了 `tsup`，它配置简单且速度极快。创建 `tsup.config.ts`：

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
})
```

### 1.4 搭建 Demo 环境

为了实时调试组件，我在 `demo/` 目录下放置了一个简单的 Vite React 应用，并在 `package.json` 中添加了启动命令：

```json
"scripts": {
  "dev": "tsup --watch",
  "build": "tsup",
  "demo": "vite"
}
```

这样，通过 `npm run demo` 我就可以在浏览器中实时看到组件的渲染效果，而 `npm run dev` 则负责监听源码变化并实时重新打包。

## 2. 核心架构

组件主要由以下两个核心层组成：
1.  **布局引擎 (`src/utils/layout.ts`)**: 负责处理原始的 commit 数据，将其转换为可视化的图结构（节点 Nodes 和 连线 Edges）。
2.  **渲染层 (`src/components/GitGraph.tsx`)**: 使用 SVG 技术将计算好的图结构渲染到页面上。
3.  **虚拟滚动 (`src/index.tsx`)**: 负责管理可视区域，高效渲染大量数据。

## 3. 图渲染算法 (Graph Rendering Algorithm)

组件最复杂的部分是将线性的 git commit 列表转换为拓扑图的布局算法。

### 3.1 基于"插槽" (Slot) 的布局系统

我们使用一套"插槽"系统来追踪活跃的分支。一个插槽代表图中的一个垂直列。

**算法步骤:**
1.  **遍历 Commits**: 算法从最新到最旧（从上到下）遍历所有 commit。
2.  **处理入度 (Incoming)**: 对于当前 commit，检查有哪些活跃的插槽正在"寻找"这个 commit 的 hash（即当前 commit 是之前某个节点的父节点）。
    - 如果没有插槽指向它，说明这是一个新分支的顶端 -> 分配一个新的插槽。
    - 如果有插槽指向它，将该 commit 分配给对应的插槽（优先延续主线）。
3.  **节点定位**: 确定 commit 的坐标 `(x, y)`，其中 `x` 是插槽索引，`y` 是 commit 在列表中的索引。
4.  **处理出度 (Outgoing/Parents)**:
    - 第一个父节点继承当前的插槽（延续分支线条）。
    - 后续的父节点（如 Merge Base 或分叉点）分配新的可用插槽。
5.  **插槽管理**: 活跃插槽会记录 `nextParentHash`（下一个要找的父节点 hash）和当前分支的 `color`。

### 3.2 连线绘制 (贝塞尔曲线)

为了实现类似 GitHub 提交记录的平滑曲线效果：
- **SVG Path**: 使用 `<path>` 元素配合三次贝塞尔曲线指令 (`C`)。
- **曲线逻辑**:
    - 起点: `(x1, y1)` (子节点)
    - 终点: `(x2, y2)` (父节点)
    - 控制点: 通过计算控制点，确保线条从起点垂直向下出发，并垂直进入终点。
    - 公式: `M x1 y1 C x1 (y1 + c), x2 (y2 - c), x2 y2`，其中 `c` 是曲率因子。

### 3.3 颜色管理

- **Hash 映射**: 使用 commit hash 计算颜色索引。
- **一致性**: 确保同一条分支无论何时渲染，都能获得相同的颜色，保证视觉上的连续性。

## 4. 性能优化

为了能够流畅展示包含数千条提交记录的大型仓库，我们进行了以下优化。

### 4.1 虚拟滚动 (Virtual Scrolling)
面对 1000+ 的节点，我们不渲染所有 DOM，只渲染可视区域加上少量缓冲区的内容。
- **容器高度**: 根据 `总数量 * 行高` 撑开容器。
- **可视范围**: 根据当前的 `scrollTop` 计算出需要渲染的 `startIndex` 和 `endIndex`。
- **按需渲染**: 只将该范围内的节点和连线传递给 React 进行渲染。

### 4.2 懒加载 (Lazy Loading)
组件支持 `onLoadMore` 属性。
- 当用户滚动到底部附近（触发 `threshold` 阈值）时，回调函数被触发以获取更多数据。
- 新数据追加到列表后，增量或重新计算布局，实现无限滚动体验。

## 5. 发布流程

为了发布到公网 npm 仓库，包名定为 `@hayrsiane/git-commit-tree`。

- **构建**: 运行 `npm run build` 生成 `dist/index.js` (CJS) 和 `dist/index.mjs` (ESM)。
- **发布**: 
    1. 确保已登录 npm: `npm login`
    2. 发布到公网: `npm publish --access public`
