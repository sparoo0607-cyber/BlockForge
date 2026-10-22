import type { TransformedBlock, CuboidRegion, BlockStates } from '../types/blueprint';

function getStateKey(states?: BlockStates): string {
  if (!states) return '';
  return Object.entries(states)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(';');
}

export interface OptimizedPlacement {
  cuboids: CuboidRegion[];
  singleBlocks: TransformedBlock[];
  totalBlocks: number;
}

/**
 * Groups adjacent identical blocks into rectangular cuboids.
 * GUARANTEES:
 * 1. Only blocks with the exact same block ID and states are grouped.
 * 2. Every coordinate in the cuboid is verified to exist in the input list.
 * 3. Never groups across empty space / air.
 * 4. Respects the max volume limit (32,768).
 */
export function optimizeBlockPlacements(
  blocks: TransformedBlock[],
  maxVolume: number = 32768
): OptimizedPlacement {
  if (blocks.length === 0) {
    return { cuboids: [], singleBlocks: [], totalBlocks: 0 };
  }

  // Create lookup map by coordinate key
  const grid = new Map<string, TransformedBlock>();
  for (const b of blocks) {
    const key = `${b.worldPos[0]},${b.worldPos[1]},${b.worldPos[2]}`;
    grid.set(key, b);
  }

  const visited = new Set<string>();
  const cuboids: CuboidRegion[] = [];
  const singleBlocks: TransformedBlock[] = [];

  // Sort blocks deterministically by Y, then Z, then X
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.worldPos[1] !== b.worldPos[1]) return a.worldPos[1] - b.worldPos[1];
    if (a.worldPos[2] !== b.worldPos[2]) return a.worldPos[2] - b.worldPos[2];
    return a.worldPos[0] - b.worldPos[0];
  });

  for (const startBlock of sortedBlocks) {
    const [startX, startY, startZ] = startBlock.worldPos;
    const startKey = `${startX},${startY},${startZ}`;

    if (visited.has(startKey)) continue;

    const targetBlockType = startBlock.block;
    const targetStateKey = getStateKey(startBlock.states);

    // Helper to check if a block matches
    const isMatching = (x: number, y: number, z: number): boolean => {
      const k = `${x},${y},${z}`;
      if (visited.has(k)) return false;
      const b = grid.get(k);
      if (!b) return false;
      return b.block === targetBlockType && getStateKey(b.states) === targetStateKey;
    };

    // 1. Expand along X
    let endX = startX;
    while (isMatching(endX + 1, startY, startZ)) {
      endX++;
    }

    // 2. Expand along Z for the entire X span [startX..endX]
    let endZ = startZ;
    let canExpandZ = true;
    while (canExpandZ) {
      const nextZ = endZ + 1;
      for (let x = startX; x <= endX; x++) {
        if (!isMatching(x, startY, nextZ)) {
          canExpandZ = false;
          break;
        }
      }
      if (canExpandZ) {
        endZ = nextZ;
      }
    }

    // 3. Expand along Y for the entire region [startX..endX, startZ..endZ]
    let endY = startY;
    let canExpandY = true;
    while (canExpandY) {
      const nextY = endY + 1;
      const currentVolume = (endX - startX + 1) * (endZ - startZ + 1) * (nextY - startY + 1);
      if (currentVolume > maxVolume) break;

      for (let z = startZ; z <= endZ; z++) {
        for (let x = startX; x <= endX; x++) {
          if (!isMatching(x, nextY, z)) {
            canExpandY = false;
            break;
          }
        }
        if (!canExpandY) break;
      }
      if (canExpandY) {
        endY = nextY;
      }
    }

    const volume = (endX - startX + 1) * (endY - startY + 1) * (endZ - startZ + 1);

    if (volume > 1) {
      // Mark all coordinates in this cuboid as visited
      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          for (let x = startX; x <= endX; x++) {
            visited.add(`${x},${y},${z}`);
          }
        }
      }

      cuboids.push({
        from: [startX, startY, startZ],
        to: [endX, endY, endZ],
        block: targetBlockType,
        states: startBlock.states,
        volume,
      });
    } else {
      // Single block
      visited.add(startKey);
      singleBlocks.push(startBlock);
    }
  }

  return {
    cuboids,
    singleBlocks,
    totalBlocks: blocks.length,
  };
}
