import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { GitGraph } from './components/GitGraph';
import { Commit } from './types';
import { processGraph } from './utils/layout';

export * from './types';
export * from './components/GitGraph';

interface GitCommitTreeProps {
  commits: Commit[];
  width?: number;
  rowHeight?: number;
  graphWidth?: number;
  height?: number | string; // Container height for virtualization
  onLoadMore?: () => Promise<void> | void;
  hasMore?: boolean;
  loading?: boolean;
  threshold?: number; // Distance in pixels to trigger onLoadMore
}

export const GitCommitTree: React.FC<GitCommitTreeProps> = ({
  commits,
  width,
  rowHeight = 60,
  graphWidth: propGraphWidth,
  height: containerHeight = 500, // Default height for virtualization
  onLoadMore,
  hasMore = false,
  loading = false,
  threshold = 200,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [hoveredHash, setHoveredHash] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [hoveredMessageHash, setHoveredMessageHash] = useState<string | null>(null);
  const [hoveredBadgeHash, setHoveredBadgeHash] = useState<string | null>(null);
  
  // Virtual Scroll State
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const COLUMN_WIDTH = 20;
  const PADDING_X = 20;

  // Process graph here to access node colors
  const { nodes, edges, height } = useMemo(() => processGraph(commits), [commits]);
  
  const graphWidth = useMemo(() => {
    if (propGraphWidth !== undefined) return propGraphWidth;
    const maxColumn = nodes.length > 0 ? Math.max(...nodes.map(n => n.x)) : 0;
    return PADDING_X + (maxColumn + 1) * COLUMN_WIDTH + 20;
  }, [nodes, propGraphWidth]);

  // Determine if we need compact mode for refs
  const textSpace = containerWidth - graphWidth;
  const isCompactRefs = textSpace < 550; // Threshold for collapsing

  // Create a map for quick color lookup
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach(node => map.set(node.hash, node.color));
    return map;
  }, [nodes]);

  // Virtual Scroll Calculations
  const totalHeight = commits.length * rowHeight;
  
  // Parse container height to number if possible (for calculation)
  // If containerHeight is a string (e.g. "100%"), we rely on offsetHeight from ref, but for initial render we might need a guess or use ResizeObserver height.
  // We already track containerWidth via ResizeObserver. We should probably track container height too if it's dynamic.
  const [actualHeight, setActualHeight] = useState<number>(typeof containerHeight === 'number' ? containerHeight : 500);

  useEffect(() => {
    if (typeof containerHeight === 'number') {
      setActualHeight(containerHeight);
    } else if (containerRef.current) {
        setActualHeight(containerRef.current.clientHeight);
    }
  }, [containerHeight, containerWidth]); // Update when width changes (resize) or prop changes

  // Visible Range
  const buffer = 5; // Render 5 extra rows above and below
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const visibleEndIndex = Math.min(commits.length - 1, Math.ceil((scrollTop + actualHeight) / rowHeight) + buffer);
  
  const visibleCommits = commits.slice(visibleStartIndex, visibleEndIndex + 1);

  // Lazy Load Trigger
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;
    setScrollTop(currentScrollTop);

    if (onLoadMore && hasMore && !loading) {
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      
      if (scrollHeight - currentScrollTop - clientHeight < threshold) {
        onLoadMore();
      }
    }
  }, [onLoadMore, hasMore, loading, threshold]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: width || '100%', 
        height: containerHeight,
        fontFamily: 'sans-serif', 
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      onScroll={handleScroll}
    >
      {/* Phantom Container for Scroll Height */}
      <div style={{ height: totalHeight, position: 'relative', width: '100%' }}>
        
        {/* Visible Content Layer */}
        <div style={{
           position: 'absolute',
           top: visibleStartIndex * rowHeight,
           left: 0,
           width: '100%',
           height: (visibleEndIndex - visibleStartIndex + 1) * rowHeight,
        }}>
            
            {/* SVG Graph Layer */}
            <div 
                style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: graphWidth, 
                zIndex: 10, 
                pointerEvents: 'none' 
                }}
            >
                <GitGraph 
                nodes={nodes}
                edges={edges}
                height={height}
                rowHeight={rowHeight} 
                width={graphWidth}
                columnWidth={COLUMN_WIDTH}
                paddingX={PADDING_X} 
                visibleStartIndex={visibleStartIndex}
                visibleEndIndex={visibleEndIndex}
                />
            </div>

            {/* Rows Layer */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {visibleCommits.map((commit, index) => {
                const isHovered = hoveredHash === commit.hash;
                const isSelected = selectedHash === commit.hash;
                const nodeColor = colorMap.get(commit.hash) || '#000'; 
                
                const isBranchTip = commit.refs?.some(ref => {
                    const isTag = ref.includes('tag') || ref.startsWith('v');
                    const isRemote = ref.includes('origin');
                    return !isTag && !isRemote;
                });

                const textColor = isBranchTip ? nodeColor : undefined;

                return (
                    <div
                    key={commit.hash}
                    style={{
                        height: rowHeight,
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoveredHash(commit.hash)}
                    onMouseLeave={() => setHoveredHash(null)}
                    onClick={() => setSelectedHash(commit.hash)}
                    >
                    {/* Background Highlight */}
                    {(isHovered || isSelected) && (
                        <div
                        style={{
                            position: 'absolute',
                            top: 2,
                            left: 2,
                            right: 2,
                            bottom: 2,
                            backgroundColor: isSelected ? '#e6f7ff' : '#f5f5f5',
                            zIndex: 0,
                            borderRadius: 8,
                        }}
                        />
                    )}

                    {/* Text Content */}
                    <div
                        style={{
                        marginLeft: graphWidth,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        paddingLeft: 10,
                        position: 'relative',
                        }}
                    >
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: textColor || '#6e7781', fontFamily: 'monospace' }}>{commit.hash.substring(0, 7)}</span>
                        <span style={{ margin: '0 8px', color: textColor || '#888' }}>-</span>
                        <span 
                            style={{ 
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: textColor || 'inherit'
                            }}
                            title={commit.author.name}
                        >
                            {commit.author.name}
                        </span>
                        <span style={{ margin: '0 8px', color: textColor || '#888' }}>-</span>
                        <span style={{ color: textColor || '#666', whiteSpace: 'nowrap' }}>
                            {(() => {
                            const ts = commit.author.timestamp;
                            const date = new Date(ts < 10000000000 ? ts * 1000 : ts);
                            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' });
                            })()}
                        </span>
                        
                        {(() => {
                            if (!commit.refs || commit.refs.length === 0) return null;
                            
                            const showAll = !isCompactRefs || commit.refs.length <= 1;
                            const visibleRefs = showAll ? commit.refs : [commit.refs[0]];
                            const hiddenCount = commit.refs.length - visibleRefs.length;
                            const hiddenRefs = commit.refs.slice(visibleRefs.length);

                            return (
                            <>
                                <span style={{ width: '16px' }} />
                                {visibleRefs.map((ref, index) => {
                                const isTag = ref.includes('tag') || ref.startsWith('v');
                                const isHead = ref.includes('HEAD');
                                const isRemote = ref.includes('origin');
                                
                                let style: React.CSSProperties = {
                                    fontSize: '11px', 
                                    padding: '1px 6px', 
                                    borderRadius: '4px', 
                                    marginRight: '4px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    fontWeight: 600,
                                    border: '1px solid transparent'
                                };

                                if (isHead) {
                                    style.color = '#cf222e';
                                    style.backgroundColor = '#ffebe9';
                                    style.border = '1px solid rgba(207, 34, 46, 0.4)';
                                } else if (isTag) {
                                    style.color = '#0969da';
                                    style.backgroundColor = '#eff6ff';
                                    style.border = '1px solid rgba(9, 105, 218, 0.4)';
                                } else if (isRemote) {
                                    style.color = '#0969da';
                                    style.backgroundColor = '#eff6ff';
                                    style.border = '1px solid rgba(9, 105, 218, 0.4)';
                                } else {
                                    style.color = nodeColor;
                                    style.backgroundColor = nodeColor + '20';
                                    style.border = `1px solid ${nodeColor}60`;
                                }

                                return (
                                    <span key={index} style={style}>
                                    {ref}
                                    </span>
                                );
                                })}
                                
                                {hiddenCount > 0 && (
                                <span 
                                    style={{ 
                                    fontSize: '11px', 
                                    padding: '1px 6px', 
                                    borderRadius: '4px', 
                                    backgroundColor: '#f6f8fa', 
                                    color: '#24292f',
                                    border: '1px solid #d0d7de',
                                    fontWeight: 600,
                                    cursor: 'default',
                                    position: 'relative'
                                    }}
                                    onMouseEnter={() => setHoveredBadgeHash(commit.hash)}
                                    onMouseLeave={() => setHoveredBadgeHash(null)}
                                >
                                    +{hiddenCount}
                                    
                                    {hoveredBadgeHash === commit.hash && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        marginBottom: '6px',
                                        zIndex: 200,
                                        backgroundColor: 'rgba(31, 35, 40, 0.9)',
                                        backdropFilter: 'blur(2px)',
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        pointerEvents: 'none'
                                    }}>
                                        {hiddenRefs.map(r => <div key={r} style={{ padding: '2px 0' }}>{r}</div>)}
                                    </div>
                                    )}
                                </span>
                                )}
                            </>
                            );
                        })()}
                        </div>
                        <div 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            position: 'relative' 
                        }}
                        onMouseEnter={() => setHoveredMessageHash(commit.hash)}
                        onMouseLeave={() => setHoveredMessageHash(null)}
                        >
                        <span 
                            style={{ 
                            fontSize: '14px', 
                            color: textColor || '#24292f',
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            marginRight: '8px',
                            flex: 1, 
                            minWidth: 0
                            }}
                        >
                            {commit.message.length > 30 ? commit.message.substring(0, 30) + '...' : commit.message}
                        </span>

                        {hoveredMessageHash === commit.hash && commit.message.length > 30 && (
                            <div style={{
                            position: 'absolute',
                            top: '-4px',
                            left: '-8px',
                            zIndex: 100,
                            backgroundColor: 'rgba(193,193,193)',
                            backdropFilter: 'blur(2px)',
                            color: '#24292f',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            whiteSpace: 'normal',
                            boxShadow: '0 8px 24px rgba(140,149,159,0.2)',
                            maxWidth: '400px',
                            pointerEvents: 'none'
                            }}>
                            {commit.message}
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            
        </div>
      </div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
            Loading...
        </div>
      )}
    </div>
  );
};
