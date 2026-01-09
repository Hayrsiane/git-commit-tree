export interface Commit {
  hash: string;
  parents: string[];
  author: {
    name: string;
    email: string;
    timestamp: number;
  };
  message: string;
  refs?: string[];
}

export interface GraphNode extends Commit {
  x: number;
  y: number;
  color: string;
  // Index in the sorted array
  index: number;
  isMerge?: boolean;
}

export interface GraphEdge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  type: 'straight' | 'merge' | 'fork';
}

