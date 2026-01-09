import { Commit, GraphNode, GraphEdge } from '../types';

const DEFAULT_COLORS = [
  // Main
  '#0052cc', // Deep Blue
  '#0095ff', // Light Blue
  '#ff5630', // Orange Red
  '#ffab00', // Orange Yellow
  '#36b37e', // Green
  '#6554c0', // Purple
  '#8993a4', // Light Blue Grey
  '#eb5757', // Red
  
  // Aux
  '#6554c0', // Purple (Duplicate, but in user list)
  '#00c781', // Green
  '#b96840', // Brown
  '#ffc400', // Bright Yellow
  '#00875a', // Deep Green
  '#8993a4', // Grey Blue (Duplicate)
  '#5e6c84', // Deep Grey Blue
  '#9733ee', // Rose Purple
];

interface BranchSlot {
  nextParentHash: string;
  color: string;
}

export function processGraph(commits: Commit[], colors = DEFAULT_COLORS): { nodes: GraphNode[], edges: GraphEdge[], height: number } {
  // We skip the legacy implementation and go straight to the edge-aware one
  return processGraphWithEdges(commits, colors);
}

function processGraphWithEdges(commits: Commit[], colors: string[]) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // Slot state:
  // nextParentHash: the hash this slot is looking for.
  // color: current color of the line.
  // lastNode: the {x, y} of the node that last touched this slot.
  interface SlotState {
    nextParentHash: string;
    color: string;
    lastX: number;
    lastY: number;
  }
  
  const activeSlots: (SlotState | null)[] = [];

  const getHashColor = (hash: string) => {
    let sum = 0;
    for (let i = 0; i < hash.length; i++) {
      sum += hash.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  commits.forEach((commit, index) => {
    // 1. Find slots pointing to this commit
    const incomingIndices: number[] = [];
    activeSlots.forEach((slot, idx) => {
      if (slot && slot.nextParentHash === commit.hash) {
        incomingIndices.push(idx);
      }
    });

    let x = -1;
    let nodeColor = '';

    if (incomingIndices.length === 0) {
      // New tip
      let slotIdx = activeSlots.indexOf(null);
      if (slotIdx === -1) slotIdx = activeSlots.length;
      x = slotIdx;
      nodeColor = getHashColor(commit.hash);
    } else {
      // Continue existing
      x = incomingIndices[0];
      const mainSlot = activeSlots[x]!;
      nodeColor = mainSlot.color;

      // Create edges from all incoming slots to this node
      incomingIndices.forEach(fromIdx => {
        const slot = activeSlots[fromIdx]!;
        
        // If fromIdx === x, it's a straight line (mostly), unless it's a merge into the main line
        // type logic:
        // if fromIdx === x, straight?
        // if fromIdx !== x, it's a merge (the branch at fromIdx is merging into x)
        
        edges.push({
          fromX: slot.lastX,
          fromY: slot.lastY,
          toX: x,
          toY: index,
          color: slot.color,
          type: fromIdx === x ? 'straight' : 'merge'
        });
      });
    }

    // Node
    const node: GraphNode = {
      ...commit,
      x,
      y: index,
      color: nodeColor,
      index,
      isMerge: commit.parents.length > 1
    };
    nodes.push(node);

    // 2. Clear incoming slots
    incomingIndices.forEach(idx => {
       activeSlots[idx] = null;
    });

    // 3. Setup outgoing slots (parents)
    if (commit.parents.length > 0) {
      commit.parents.forEach((parentHash, pIdx) => {
        let targetX: number;
        let branchColor: string;
        let type: 'straight' | 'fork';

        if (pIdx === 0) {
          // Continue main branch
          targetX = x;
          branchColor = nodeColor;
          type = 'straight';
        } else {
          // Fork / New branch base
          let slotIdx = activeSlots.indexOf(null);
          if (slotIdx === -1) slotIdx = activeSlots.length;
          targetX = slotIdx;
          branchColor = getHashColor(parentHash);
          type = 'fork';
          
          // Also create a "fork" edge immediately?
          // No, the edge is created when we reach the parent.
          // But visually, we want to see the line leaving *this* node.
          // The "edge" is strictly between two nodes. 
          // Our loop above creates edges when we *arrive* at a node.
          // So when we arrive at 'parent', we will look back at 'this node'.
          // So we just need to record 'this node' as the 'lastNode' for the slot.
        }

        // Check if targetX is already occupied?
        // In this algorithm (Newest->Oldest), a slot tracks *one* active connection.
        // If multiple branches point to the same parent (merge base), 
        // they will eventually collide at that parent (processed above).
        // But right now, can two parents of *this* commit claim the same slot?
        // No, we assign pIdx=0 to x, pIdx>0 to new slots. They are distinct.
        // What if another branch is *already* pointing to the same parent?
        // E.g. A->P, B->P.
        // We processed A. Slot S1 points to P.
        // Now we process B. Slot S2 points to P.
        // When we reach P, incomingIndices will be [S1, S2].
        // So we are safe.

        // Wait, collision check:
        // If we assign targetX, we must ensure activeSlots[targetX] is empty.
        // For pIdx=0, we just cleared activeSlots[x], so it's empty.
        // For pIdx>0, we searched for null, so it's empty.
        // EXCEPT: What if another branch (processed earlier in this loop? No, sequential)
        // What if another *unrelated* branch is using a slot?
        // We only use 'null' slots, so we are safe.
        // But wait, "If multiple branches point to the same parent".
        // Suppose A -> P (slot 0).
        // B -> P (slot 1).
        // We haven't reached P yet.
        // activeSlots[0].next = P.
        // activeSlots[1].next = P.
        // This is fine. P will collect both.
        
        // HOWEVER, there is an edge case:
        // What if we try to use a slot that is already occupied by a DIFFERENT parent?
        // E.g. pIdx=0 wants slot 'x'.
        // But what if 'x' was NOT cleared?
        // We cleared incomingIndices.
        // So 'x' is definitely clear IF it was incoming.
        // If 'x' was NOT incoming (i.e. we started a new branch at 'x'), then it's occupied?
        // No, if we started a new branch, we found a free slot.
        
        // Wait, "Case A: No children point to this commit".
        // We picked a free slot 'x'.
        // activeSlots[x] was null.
        // So we are safe.
        
        activeSlots[targetX] = {
          nextParentHash: parentHash,
          color: branchColor,
          lastX: x,
          lastY: index
        };
      });
    }
  });

  return { nodes, edges, height: nodes.length };
}
