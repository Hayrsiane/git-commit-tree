import { Commit } from '../src/types';

// Helper to generate a random hash
const randomHash = () => 
  Math.random().toString(16).substring(2, 12) + 
  Math.random().toString(16).substring(2, 12) + 
  Math.random().toString(16).substring(2, 12) + 
  Math.random().toString(16).substring(2, 6);

// Define hashes for stable reference
const h1 = '1111111111111111111111111111111111111111'; // init
const h2 = '2222222222222222222222222222222222222222'; // master 1
const h3 = '3333333333333333333333333333333333333333'; // dev start
const h4 = '4444444444444444444444444444444444444444'; // dev 1
const h5 = '5555555555555555555555555555555555555555'; // feature A start
const h6 = '6666666666666666666666666666666666666666'; // feature A 1
const h7 = '7777777777777777777777777777777777777777'; // feature A 2
const h8 = '8888888888888888888888888888888888888888'; // dev 2 (merge A)
const h9 = '9999999999999999999999999999999999999999'; // feature B start
const h10 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // feature B 1
const h11 = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'; // feature B 2
const h12 = 'cccccccccccccccccccccccccccccccccccccccc'; // feature B 3
const h13 = 'dddddddddddddddddddddddddddddddddddddddd'; // master 2
const h14 = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // hotfix start
const h15 = 'ffffffffffffffffffffffffffffffffffffffff'; // hotfix 1
const h16 = '0000000000000000000000000000000000000000'; // master 3 (merge hotfix)
const h17 = '1234567890123456789012345678901234567890'; // dev 3
const h18 = '0987654321098765432109876543210987654321'; // master 4 (merge dev)
const h19 = 'abcdefabcdefabcdefabcdefabcdefabcdefabcd'; // release start
const h20 = '1231231231231231231231231231231231231231'; // release 1

export const mockCommits: Commit[] = [
  // Newest commits first
  {
    hash: h20,
    parents: [h19],
    author: { name: 'Alice', email: 'alice@example.com', timestamp: 1677800000000 },
    message: 'Release: prepare v1.1.0',
    refs: ['HEAD -> release/v1.1.0']
  },
  {
    hash: h19,
    parents: [h18],
    author: { name: 'Alice', email: 'alice@example.com', timestamp: 1677795000000 },
    message: 'Bump version to 1.1.0-beta',
    refs: ['origin/release/v1.1.0']
  },
  {
    hash: h18,
    parents: [h16, h17], // Merge dev into master
    author: { name: 'Bob', email: 'bob@example.com', timestamp: 1677790000000 },
    message: 'Merge branch \'develop\'',
    refs: ['master', 'origin/master', 'tag: v1.0.1']
  },
  {
    hash: h17,
    parents: [h8, h12], // Merge feature B into dev
    author: { name: 'Charlie', email: 'charlie@example.com', timestamp: 1677785000000 },
    message: 'Merge branch \'feature/ui-redesign\' into develop',
    refs: ['develop']
  },
  {
    hash: h16,
    parents: [h13, h15], // Merge hotfix into master
    author: { name: 'Dave', email: 'dave@example.com', timestamp: 1677780000000 },
    message: 'Merge branch \'hotfix/login-bug\'',
  },
  {
    hash: h15,
    parents: [h14],
    author: { name: 'Dave', email: 'dave@example.com', timestamp: 1677775000000 },
    message: 'Fix: Null pointer exception in login flow',
    refs: ['hotfix/login-bug']
  },
  {
    hash: h14,
    parents: [h13],
    author: { name: 'Dave', email: 'dave@example.com', timestamp: 1677770000000 },
    message: 'Hotfix: start investigation',
  },
  {
    hash: h13,
    parents: [h2],
    author: { name: 'Alice', email: 'alice@example.com', timestamp: 1677765000000 },
    message: 'Docs: update readme',
  },
  {
    hash: h12,
    parents: [h11],
    author: { name: 'Eve', email: 'eve@example.com', timestamp: 1677760000000 },
    message: 'UI: polish buttons and inputs',
    refs: ['feature/ui-redesign']
  },
  {
    hash: h11,
    parents: [h10],
    author: { name: 'Eve', email: 'eve@example.com', timestamp: 1677755000000 },
    message: 'UI: update color scheme to dark mode',
  },
  {
    hash: h10,
    parents: [h9],
    author: { name: 'Eve', email: 'eve@example.com', timestamp: 1677750000000 },
    message: 'UI: refactor layout components',
  },
  {
    hash: h9,
    parents: [h4],
    author: { name: 'Eve', email: 'eve@example.com', timestamp: 1677745000000 },
    message: 'Feat: start ui redesign',
  },
  {
    hash: h8,
    parents: [h4, h7], // Merge feature A into dev
    author: { name: 'Frank', email: 'frank@example.com', timestamp: 1677740000000 },
    message: 'Merge branch \'feature/api-optimization\' into develop',
  },
  {
    hash: h7,
    parents: [h6],
    author: { name: 'Frank', email: 'frank@example.com', timestamp: 1677735000000 },
    message: 'API: add caching layer',
    refs: ['feature/api-optimization']
  },
  {
    hash: h6,
    parents: [h5],
    author: { name: 'Frank', email: 'frank@example.com', timestamp: 1677730000000 },
    message: 'API: optimize database queries',
  },
  {
    hash: h5,
    parents: [h4],
    author: { name: 'Frank', email: 'frank@example.com', timestamp: 1677725000000 },
    message: 'Feat: start api optimization',
  },
  {
    hash: h4,
    parents: [h3],
    author: { name: 'Charlie', email: 'charlie@example.com', timestamp: 1677720000000 },
    message: 'Dev: setup development environment',
  },
  {
    hash: h3,
    parents: [h2],
    author: { name: 'Charlie', email: 'charlie@example.com', timestamp: 1677715000000 },
    message: 'Dev: init branch',
  },
  {
    hash: h2,
    parents: [h1],
    author: { name: 'Alice', email: 'alice@example.com', timestamp: 1677710000000 },
    message: 'Project: add initial structure',
    refs: ['tag: v1.0.0']
  },
  {
    hash: h1,
    parents: [],
    author: { name: 'Alice', email: 'alice@example.com', timestamp: 1677700000000 },
    message: 'Initial commit',
  }
];

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

  let currentTime = Date.now() - count * 3600 * 1000;
  
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
  const featureBranches = [
    'feat/login', 'feat/ui', 'fix/bug', 'chore/deps', 
    'refactor/core', 'docs/api', 'style/theme', 'test/e2e',
    'perf/render', 'ci/pipeline', 'feat/dashboard', 'fix/crash'
  ];
  
  for (let i = 1; i < count; i++) {
    currentTime += 3600 * 1000 + Math.random() * 3600 * 1000;
    
    // Decide action: 
    // 0-80%: Commit on existing branch (Longer branches)
    // 80-95%: Create new branch (More branches)
    // 95-100%: Merge branch
    
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

    if (action < 0.8 || branchNames.length === 1) {
        // Normal commit on current branch
        activeTips[currentBranch] = hash;
        newCommit.message = `[${currentBranch}] ${message}`;
    } else if (action < 0.95) {
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
            // Reduce chance to close branch to make them longer (20% chance to close)
            if (Math.random() > 0.8) {
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
