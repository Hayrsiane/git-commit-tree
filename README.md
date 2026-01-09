# git-commit-tree

English | [简体中文](./README_zh-CN.md)

![Project Preview](https://cdn.picui.cn/vip/2026/01/09/69608d4dc647e.jpg)

A performant and customizable React component for visualizing git commit history as a graph, similar to GitHub's network graph or SourceTree.

## Features

- 🎨 **GitHub-like Design**: Clean and familiar visual style with branch coloring.
- 🚀 **High Performance**: Built-in virtual scrolling to handle thousands of commits smoothly.
- 🌲 **SVG Rendering**: Crisp and scalable graph visualization using SVG.
- 🖱️ **Interactive**: Hover effects, selection support, and tooltip for long commit messages.
- 📏 **Responsive**: Auto-calculates layout width and adapts to container size.
- ⚡ **Lazy Loading**: Supports infinite scrolling / loading more commits on demand.

## Installation

```bash
npm install @hayrsiane/git-commit-tree
```

## Usage

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
      message: 'Fix bug in parser',
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
      message: 'Initial commit',
      refs: ['tag: v1.0.0'],
    },
  ];

  const handleLoadMore = async () => {
    // Fetch more commits...
    console.log('Loading more...');
  };

  return (
    <div style={{ height: '600px', border: '1px solid #ccc' }}>
      <GitCommitTree
        commits={commits}
        height="100%" // Container height for virtualization
        rowHeight={60} // Optional: custom row height
        onLoadMore={handleLoadMore}
        hasMore={false}
      />
    </div>
  );
};

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commits` | `Commit[]` | **Required** | Array of commit objects to render. |
| `width` | `number \| string` | `'100%'` | Width of the container. |
| `height` | `number \| string` | `500` | Height of the container (crucial for virtual scrolling). |
| `rowHeight` | `number` | `60` | Height of each commit row in pixels. |
| `graphWidth` | `number` | `undefined` | Manually set width of the graph area. If not provided, it's calculated automatically. |
| `onLoadMore` | `() => Promise<void> \| void` | `undefined` | Callback function triggered when scrolling near the bottom. |
| `hasMore` | `boolean` | `false` | Whether there are more commits to load. |
| `loading` | `boolean` | `false` | Loading state indicator. |
| `threshold` | `number` | `200` | Distance in pixels from bottom to trigger `onLoadMore`. |

## Types

### Commit

```typescript
interface Commit {
  hash: string;
  parents: string[];
  author: {
    name: string;
    email: string;
    timestamp: number; // Unix timestamp in seconds or milliseconds
  };
  message: string;
  refs?: string[]; // e.g., ['HEAD', 'master', 'tag: v1.0.0']
}
```

## License

MIT
