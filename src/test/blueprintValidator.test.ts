import { describe, it, expect } from 'vitest';
import { validateBlueprint } from '../engine/blueprintValidator';
import { ALL_BLUEPRINTS } from '../data/blueprints';

describe('Blueprint Validator', () => {
  it('validates all 5 built-in starter blueprints successfully', () => {
    expect(ALL_BLUEPRINTS.length).toBeGreaterThanOrEqual(5);

    for (const bp of ALL_BLUEPRINTS) {
      const result = validateBlueprint(bp);
      expect(result.valid, `Blueprint "${bp.name}" failed validation: ${result.errors.join(', ')}`).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(bp.blocks.length).toBeGreaterThan(0);
      expect(bp.dimensions.width).toBeGreaterThan(0);
      expect(bp.dimensions.height).toBeGreaterThan(0);
      expect(bp.dimensions.depth).toBeGreaterThan(0);
    }
  });

  it('rejects blueprints with invalid or negative dimensions', () => {
    const invalidBp = {
      id: 'bad-bp',
      slug: 'bad-bp',
      name: 'Bad',
      description: 'Bad',
      dimensions: { width: -5, height: 4, depth: 4 },
      origin: [0, 0, 0],
      blocks: [{ pos: [0, 0, 0], block: 'minecraft:stone' }],
      supportedEditions: ['java'],
    };
    const res = validateBlueprint(invalidBp);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Invalid width'))).toBe(true);
  });

  it('rejects duplicate block placements at the same coordinate', () => {
    const duplicateBp = {
      id: 'dup-bp',
      slug: 'dup-bp',
      name: 'Duplicate',
      description: 'Duplicate',
      dimensions: { width: 5, height: 5, depth: 5 },
      origin: [0, 0, 0],
      blocks: [
        { pos: [1, 1, 1], block: 'minecraft:oak_planks' },
        { pos: [1, 1, 1], block: 'minecraft:glass' },
      ],
      supportedEditions: ['java', 'bedrock'],
    };
    const res = validateBlueprint(duplicateBp);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Duplicate block placement'))).toBe(true);
  });

  it('rejects block placements exceeding declared dimensions', () => {
    const outOfBoundsBp = {
      id: 'oob-bp',
      slug: 'oob-bp',
      name: 'OOB',
      description: 'OOB',
      dimensions: { width: 4, height: 4, depth: 4 },
      origin: [0, 0, 0],
      blocks: [{ pos: [5, 2, 2], block: 'minecraft:stone' }],
      supportedEditions: ['java'],
    };
    const res = validateBlueprint(outOfBoundsBp);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('exceeds declared width'))).toBe(true);
  });
});
