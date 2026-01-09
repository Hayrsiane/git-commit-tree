import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GitCommitTree } from '../src';
import { mockCommits, generateCommits } from './data';
import { Commit } from '../src/types';

const LargeDataDemo = () => {
  const [allCommits, setAllCommits] = useState<Commit[]>([]);
  const [visibleCommits, setVisibleCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initialize with large data
  useEffect(() => {
    const data = generateCommits(2000); // Generate 2000 commits
    setAllCommits(data);
    setVisibleCommits(data.slice(0, 50)); // Start with 50
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleCommits(prev => {
      const nextCount = prev.length + 50;
      if (nextCount >= allCommits.length) {
        setHasMore(false);
        return allCommits;
      }
      return allCommits.slice(0, nextCount);
    });
    setLoading(false);
  }, [allCommits, loading, hasMore]);

  return (
    <div>
      <h3>Large Data & Lazy Loading Demo</h3>
      <p>Total generated: {allCommits.length}, Loaded: {visibleCommits.length}</p>
      <div style={{ height: 600, border: '1px solid #e1e4e8', borderRadius: 6 }}>
        <GitCommitTree 
          commits={visibleCommits} 
          height="100%"
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
        />
      </div>
    </div>
  );
};

const App = () => {
  const [mode, setMode] = useState<'simple' | 'large'>('simple');

  return (
    <div style={{ padding: 20, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Git Commit Tree Demo</h1>
        <div>
            <button 
                onClick={() => setMode('simple')}
                style={{ 
                    marginRight: 10, 
                    padding: '8px 16px',
                    background: mode === 'simple' ? '#0969da' : '#f6f8fa',
                    color: mode === 'simple' ? 'white' : 'black',
                    border: '1px solid #d0d7de',
                    borderRadius: 6,
                    cursor: 'pointer'
                }}
            >
                Simple Data
            </button>
            <button 
                onClick={() => setMode('large')}
                style={{ 
                    padding: '8px 16px',
                    background: mode === 'large' ? '#0969da' : '#f6f8fa',
                    color: mode === 'large' ? 'white' : 'black',
                    border: '1px solid #d0d7de',
                    borderRadius: 6,
                    cursor: 'pointer'
                }}
            >
                Large Data (Virtual Scroll)
            </button>
        </div>
      </div>
      
      {mode === 'simple' ? (
        <div style={{ border: '1px solid #e1e4e8', borderRadius: 6 }}>
          <GitCommitTree commits={mockCommits} />
        </div>
      ) : (
        <LargeDataDemo />
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
