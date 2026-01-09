import { Commit } from '../src/types';

export function generateCommits(count: number): Commit[] {
  const commits: Commit[] = [];
  const authors = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' },
    { name: 'David', email: 'david@example.com' },
    { name: 'Eve', email: 'eve@example.com' },
  ];

  const messages = [
    'Fix bug in parser',
    'Add new feature',
    'Update documentation',
    'Refactor code',
    'Optimize performance',
    'Merge branch',
    'Initial commit',
    'Update dependencies',
    'Fix typo',
    'Add tests',
  ];

  let currentTime = Date.now();
  
  // Track active branches (heads)
  // Each element is a commit hash
  let branches: { name: string, head: string }[] = [];
  
  // Initial commit
  const initialHash = 'init' + Math.random().toString(36).substring(2, 9);
  commits.push({
    hash: initialHash,
    parents: [],
    author: { ...authors[0], timestamp: Math.floor(currentTime / 1000) },
    message: 'Initial commit',
    refs: ['master', 'HEAD'],
  });
  branches.push({ name: 'master', head: initialHash });

  for (let i = 1; i < count; i++) {
    currentTime -= 3600 * 1000 + Math.random() * 3600 * 1000; // Go backwards in time? 
    // Wait, usually commits are ordered by time descending for the list, 
    // but the graph processing might expect them in topological order.
    // Let's generate them in chronological order (parents first) and then reverse if needed.
    // Actually, git log usually shows newest first.
    // So let's generate from oldest to newest, then reverse the array.
  }
  
  // Let's restart with oldest first strategy
  commits.length = 0;
  currentTime = Date.now() - count * 3600 * 1000;
  
  const initialHash2 = '0000000';
  commits.push({
    hash: initialHash2,
    parents: [],
    author: { ...authors[0], timestamp: Math.floor(currentTime / 1000) },
    message: 'Initial commit',
    refs: [],
  });
  
  // Active tips of branches
  // 'master' is the main branch
  const activeTips: { [branch: string]: string } = { 'master': initialHash2 };
  
  // Other potential branches
  const featureBranches = ['feat/login', 'feat/ui', 'fix/bug-123', 'chore/deps'];
  
  for (let i = 1; i < count; i++) {
    currentTime += 3600 * 1000 + Math.random() * 3600 * 1000;
    
    // Decide action: 
    // 0-60%: Commit on existing branch
    // 60-80%: Create new branch
    // 80-100%: Merge branch
    
    const action = Math.random();
    const branchNames = Object.keys(activeTips);
    const currentBranch = branchNames[Math.floor(Math.random() * branchNames.length)];
    const parent = activeTips[currentBranch];
    
    const hash = Math.random().toString(36).substring(2, 9);
    const author = authors[Math.floor(Math.random() * authors.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    let newCommit: Commit = {
        hash,
        parents: [parent],
        author: { ...author, timestamp: Math.floor(currentTime / 1000) },
        message,
    };

    if (action < 0.7 || branchNames.length === 1) {
        // Normal commit on current branch
        activeTips[currentBranch] = hash;
        newCommit.message = `[${currentBranch}] ${message}`;
    } else if (action < 0.85) {
        // Create new branch from current
        const newBranchName = featureBranches[Math.floor(Math.random() * featureBranches.length)] + '-' + i;
        activeTips[newBranchName] = hash;
        newCommit.message = `Start branch ${newBranchName}`;
    } else {
        // Merge
        // Pick another branch to merge into current
        const otherBranches = branchNames.filter(b => b !== currentBranch);
        if (otherBranches.length > 0) {
            const otherBranch = otherBranches[Math.floor(Math.random() * otherBranches.length)];
            const otherTip = activeTips[otherBranch];
            newCommit.parents.push(otherTip);
            newCommit.message = `Merge branch '${otherBranch}' into ${currentBranch}`;
            // Remove other branch from active tips if we consider it closed
            // Let's keep it active with 50% chance
            if (Math.random() > 0.5) {
                delete activeTips[otherBranch];
            }
            activeTips[currentBranch] = hash;
        } else {
             // Fallback to normal commit
             activeTips[currentBranch] = hash;
        }
    }
    
    commits.push(newCommit);
  }

  // Assign refs to tips
  Object.entries(activeTips).forEach(([branch, hash]) => {
      const commit = commits.find(c => c.hash === hash);
      if (commit) {
          commit.refs = commit.refs || [];
          commit.refs.push(branch);
          if (branch === 'master') commit.refs.push('HEAD');
      }
  });

  // Reverse to show newest first
  return commits.reverse();
}
