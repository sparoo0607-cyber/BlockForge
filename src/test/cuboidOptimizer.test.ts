import { describe, it, expect } from 'vitest';
import { optimizeBlockPlacements } from '../engine/cuboidOptimizer';
import type { TransformedBlock } from '../types/blueprint';

describe('Cuboid Optimizer', () => {
  it('combines a 3x3x3 solid cube of identical blocks into a single /fill cuboid', () => {
    const blocks: TransformedBlock[] = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          blocks.push({
            worldPos: [100 + x, 64 + y, 200 + z],
            localPos: [x, y, z],
            block: 'minecraft:stone',
          });
        }
      }
    }

    const result = optimizeBlockPlacements(blocks);
    expect(result.cuboids).toHaveLength(1);
    expect(result.singleBlocks).toHaveLength(0);
    expect(result.cuboids[0].volume).toBe(27);
    expect(result.cuboids[0].from).toEqual([100, 64, 200]);
    expect(result.cuboids[0].to).toEqual([102, 66, 202]);
  });

  it('never groups across empty air space or unpopulated coordinates', () => {
    // Two disconnected 2x1x1 lines with an empty gap between them
    const blocks: TransformedBlock[] = [
      // Line 1: X=0..1, Y=0, Z=0
      { worldPos: [0, 64, 0], localPos: [0, 0, 0], block: 'minecraft:oak_planks' },
      { worldPos: [1, 64, 0], localPos: [1, 0, 0], block: 'minecraft:oak_planks' },
      // Gap at X=2!
      // Line 2: X=3..4, Y=0, Z=0
      { worldPos: [3, 64, 0], localPos: [3, 0, 0], block: 'minecraft:oak_planks' },
      { worldPos: [4, 64, 0], localPos: [4, 0, 0], block: 'minecraft:oak_planks' },
    ];

    const result = optimizeBlockPlacements(blocks);
    // Must produce TWO cuboids, never filling across the gap at X=2!
    expect(result.cuboids).toHaveLength(2);
    expect(result.cuboids[0].from).toEqual([0, 64, 0]);
    expect(result.cuboids[0].to).toEqual([1, 64, 0]);
    expect(result.cuboids[1].from).toEqual([3, 64, 0]);
    expect(result.cuboids[1].to).toEqual([4, 64, 0]);
  });

  it('does not group different blocks or different states together', () => {
    const blocks: TransformedBlock[] = [
      { worldPos: [0, 64, 0], localPos: [0, 0, 0], block: 'minecraft:oak_stairs', states: { facing: 'north' } },
      { worldPos: [1, 64, 0], localPos: [1, 0, 0], block: 'minecraft:oak_stairs', states: { facing: 'south' } },
    ];

    const result = optimizeBlockPlacements(blocks);
    // Since facing states differ, they cannot be filled with a single cuboid command
    expect(result.cuboids).toHaveLength(0);
    expect(result.singleBlocks).toHaveLength(2);
  });
});
