import React from 'react';
import { GraphNode, GraphEdge } from '../types';

interface GitGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height: number;
  rowHeight?: number;
  width?: number;
  dotSize?: number;
  lineWidth?: number;
  columnWidth?: number;
  paddingX?: number;
  visibleStartIndex?: number;
  visibleEndIndex?: number;
}

export const GitGraph: React.FC<GitGraphProps> = ({
  nodes,
  edges,
  height,
  rowHeight = 60,
  width = 200,
  dotSize = 4, // Default radius 4 (diameter 8)
  lineWidth = 2,
  columnWidth = 20,
  paddingX = 20,
  visibleStartIndex = 0,
  visibleEndIndex = nodes.length,
}) => {
  const paddingY = rowHeight / 2;

  // Offset Y based on start index to keep coordinate system local to the visible SVG
  const offsetY = visibleStartIndex;

  const getX = (col: number) => paddingX + col * columnWidth;
  const getY = (row: number) => paddingY + (row - offsetY) * rowHeight;

  // Filter visible nodes and edges
  // For edges: render if the vertical range intersects with [visibleStartIndex, visibleEndIndex]
  const visibleEdges = edges.filter(edge => {
    const minEdgeY = Math.min(edge.fromY, edge.toY);
    const maxEdgeY = Math.max(edge.fromY, edge.toY);
    return maxEdgeY >= visibleStartIndex && minEdgeY <= visibleEndIndex;
  });

  // For nodes: render if within range
  const visibleNodes = nodes.filter(node => node.y >= visibleStartIndex && node.y <= visibleEndIndex);

  return (
    <svg
      width={width}
      height={(visibleEndIndex - visibleStartIndex + 1) * rowHeight}
      style={{ overflow: 'visible' }}
    >
      {/* Edges */}
      {visibleEdges.map((edge, i) => {
        const x1 = getX(edge.fromX);
        const y1 = getY(edge.fromY);
        const x2 = getX(edge.toX);
        const y2 = getY(edge.toY);

        // Bezier curve
        // Vertical distance
        // const dy = y2 - y1;
        // Control point offset - fixed for rounder turns
        const c = 20; // Fixed radius for rounder turns

        let d = '';
        if (edge.type === 'straight') {
             d = `M ${x1} ${y1} L ${x2} ${y2}`;
        }
        
        // Always use bezier for smoothness
        // For standard git graph look:
        // C x1 y1+c, x2 y2-c, x2 y2
        // This makes the curve start vertically from y1 and end vertically at y2
        d = `M ${x1} ${y1} C ${x1} ${y1 + c}, ${x2} ${y2 - c}, ${x2} ${y2}`;

        return (
          <path
            key={`edge-${i}`}
            d={d}
            fill="none"
            stroke={edge.color}
            strokeWidth={lineWidth}
            strokeLinecap="round"
          />
        );
      })}

      {/* Nodes */}
      {visibleNodes.map((node) => {
        const cx = getX(node.x);
        const cy = getY(node.y);
        const isHead = node.refs?.some(ref => ref.includes('HEAD'));
        const isMerge = node.isMerge;
        
        // Node styling
        const fill = isMerge ? '#ffffff' : node.color;
        const stroke = node.color;
        const strokeWidth = isMerge ? lineWidth : 0; // Solid nodes don't need stroke if fill is same
        
        // For solid nodes, we can just use fill.
        // But user says: "Ordinary commit: solid dot, fill=color, border 1px same color".
        // So strokeWidth should be 1 or lineWidth.
        
        return (
          <g key={node.hash}>
             {/* HEAD Highlight: 1px white outer border (or light grey) */}
             {isHead && (
               <circle
                 cx={cx}
                 cy={cy}
                 r={dotSize + 2} // Slightly larger
                 fill="none"
                 stroke="#fff" // or light grey #d0d7de
                 strokeWidth={2}
               />
             )}
             
             {/* Main Dot */}
             <circle
               cx={cx}
               cy={cy}
               r={dotSize}
               fill={fill}
               stroke={stroke}
               strokeWidth={isMerge ? lineWidth : 1}
             />
          </g>
        );
      })}
    </svg>
  );
};
