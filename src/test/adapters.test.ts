import { describe, it, expect } from 'vitest';
import { JavaCommandAdapter } from '../engine/adapters/javaAdapter';
import { BedrockCommandAdapter } from '../engine/adapters/bedrockAdapter';

describe('Edition Adapters', () => {
  describe('JavaCommandAdapter', () => {
    const java = new JavaCommandAdapter();

    it('formats plain blocks and states correctly', () => {
      expect(java.formatBlock('oak_planks')).toBe('minecraft:oak_planks');
      expect(java.formatBlock('minecraft:stone_bricks')).toBe('minecraft:stone_bricks');
      expect(java.formatBlock('oak_stairs', { facing: 'north', half: 'bottom' }))
        .toBe('minecraft:oak_stairs[facing=north,half=bottom]');
    });

    it('generates valid /fill commands', () => {
      const fill = java.generateFill([0, 64, 0], [4, 64, 4], 'minecraft:oak_planks');
      expect(fill.command).toBe('/fill 0 64 0 4 64 4 minecraft:oak_planks');
      expect(fill.blockCount).toBe(25);
    });

    it('generates valid /setblock commands', () => {
      const sb = java.generateSetblock([10, 65, 20], 'minecraft:lantern', { hanging: true });
      expect(sb.command).toBe('/setblock 10 65 20 minecraft:lantern[hanging=true]');
      expect(sb.blockCount).toBe(1);
    });
  });

  describe('BedrockCommandAdapter', () => {
    const bedrock = new BedrockCommandAdapter();

    it('formats plain blocks and maps Bedrock block states correctly', () => {
      expect(bedrock.formatBlock('oak_planks')).toBe('minecraft:oak_planks');
      // Stairs mapped to weirdo_direction
      const stairBlock = bedrock.formatBlock('oak_stairs', { facing: 'north', half: 'bottom' });
      expect(stairBlock).toContain('minecraft:oak_stairs');
      expect(stairBlock).toContain('"weirdo_direction": 3');
      expect(stairBlock).toContain('"upside_down_bit": false');

      // Lantern mapped to hanging bit
      const lanternBlock = bedrock.formatBlock('lantern', { hanging: true });
      expect(lanternBlock).toBe('minecraft:lantern ["hanging": true]');
    });

    it('generates valid Bedrock /fill commands', () => {
      const fill = bedrock.generateFill([0, 64, 0], [4, 64, 4], 'minecraft:stone_bricks');
      expect(fill.command).toBe('/fill 0 64 0 4 64 4 minecraft:stone_bricks');
    });

    it('generates valid Bedrock /setblock commands', () => {
      const sb = bedrock.generateSetblock([5, 64, 5], 'minecraft:oak_planks');
      expect(sb.command).toBe('/setblock 5 64 5 minecraft:oak_planks');
    });
  });
});
