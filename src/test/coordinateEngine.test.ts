import { describe, it, expect } from 'vitest';
import {
  parseCoordinateInput,
  getRotatedDimensions,
  rotateLocalPosition,
  rotateBlockStates,
  calculateBoundingBox,
  checkWorldHeightBounds,
  transformBlueprintBlocks,
} from '../engine/coordinateEngine';
import type { BuildDimensions, BlockPlacement } from '../types/blueprint';

describe('Coordinate Engine', () => {
  describe('parseCoordinateInput', () => {
    it('accepts valid integers', () => {
      expect(parseCoordinateInput(0, 'X')).toBe(0);
      expect(parseCoordinateInput(125, 'X')).toBe(125);
      expect(parseCoordinateInput(-64, 'Y')).toBe(-64);
      expect(parseCoordinateInput('-1000', 'Z')).toBe(-1000);
      expect(parseCoordinateInput('42', 'X')).toBe(42);
    });

    it('rejects floats, NaN, non-integers, and empty strings', () => {
      expect(() => parseCoordinateInput(12.34, 'X')).toThrow(/integer/);
      expect(() => parseCoordinateInput('abc', 'X')).toThrow(/integer/);
      expect(() => parseCoordinateInput('', 'X')).toThrow(/cannot be empty/);
      expect(() => parseCoordinateInput(null, 'X')).toThrow(/number or numeric string/);
    });
  });

  describe('Rotation and Dimensions', () => {
    const dims: BuildDimensions = { width: 5, height: 10, depth: 8 };

    it('returns original dimensions for 0° and 180°', () => {
      expect(getRotatedDimensions(dims, 0)).toEqual({ width: 5, height: 10, depth: 8 });
      expect(getRotatedDimensions(dims, 180)).toEqual({ width: 5, height: 10, depth: 8 });
    });

    it('swaps width and depth for 90° and 270°', () => {
      expect(getRotatedDimensions(dims, 90)).toEqual({ width: 8, height: 10, depth: 5 });
      expect(getRotatedDimensions(dims, 270)).toEqual({ width: 8, height: 10, depth: 5 });
    });

    it('rotates positions correctly within bounding box', () => {
      const p: [number, number, number] = [0, 2, 0];
      // 0°
      expect(rotateLocalPosition(p, dims, 0)).toEqual([0, 2, 0]);
      // 90° CW: X' = (depth - 1) - Z = (8 - 1) - 0 = 7, Z' = X = 0
      expect(rotateLocalPosition(p, dims, 90)).toEqual([7, 2, 0]);
      // 180°: X' = (width - 1) - X = 4 - 0 = 4, Z' = (depth - 1) - Z = 7 - 0 = 7
      expect(rotateLocalPosition(p, dims, 180)).toEqual([4, 2, 7]);
      // 270°: X' = Z = 0, Z' = (width - 1) - X = 4 - 0 = 4
      expect(rotateLocalPosition(p, dims, 270)).toEqual([0, 2, 4]);
    });
  });

  describe('Block State Rotation', () => {
    it('rotates cardinal facing directions clockwise by 90°', () => {
      expect(rotateBlockStates({ facing: 'north' }, 90)).toEqual({ facing: 'east' });
      expect(rotateBlockStates({ facing: 'east' }, 90)).toEqual({ facing: 'south' });
      expect(rotateBlockStates({ facing: 'south' }, 90)).toEqual({ facing: 'west' });
      expect(rotateBlockStates({ facing: 'west' }, 90)).toEqual({ facing: 'north' });
    });

    it('rotates facing directions by 180°', () => {
      expect(rotateBlockStates({ facing: 'north' }, 180)).toEqual({ facing: 'south' });
      expect(rotateBlockStates({ facing: 'west' }, 180)).toEqual({ facing: 'east' });
    });

    it('rotates axis orientations', () => {
      expect(rotateBlockStates({ axis: 'x' }, 90)).toEqual({ axis: 'z' });
      expect(rotateBlockStates({ axis: 'z' }, 90)).toEqual({ axis: 'x' });
      expect(rotateBlockStates({ axis: 'y' }, 90)).toEqual({ axis: 'y' });
    });
  });

  describe('Bounding Box & Translation', () => {
    it('calculates bounding box accurately for positive, negative, and zero origins', () => {
      const rotatedDims: BuildDimensions = { width: 5, height: 6, depth: 7 };

      // At (0, 0, 0)
      const bbZero = calculateBoundingBox([0, 0, 0], rotatedDims);
      expect(bbZero.min).toEqual([0, 0, 0]);
      expect(bbZero.max).toEqual([4, 5, 6]);

      // At positive coords (100, 64, 200)
      const bbPos = calculateBoundingBox([100, 64, 200], rotatedDims);
      expect(bbPos.min).toEqual([100, 64, 200]);
      expect(bbPos.max).toEqual([104, 69, 206]);

      // At negative coords (-50, -20, -100)
      const bbNeg = calculateBoundingBox([-50, -20, -100], rotatedDims);
      expect(bbNeg.min).toEqual([-50, -20, -100]);
      expect(bbNeg.max).toEqual([-46, -15, -94]);
    });

    it('transforms blocks accurately with translation', () => {
      const blocks: BlockPlacement[] = [
        { pos: [0, 0, 0], block: 'minecraft:oak_planks' },
        { pos: [2, 1, 3], block: 'minecraft:glass_pane' },
      ];
      const dimensions: BuildDimensions = { width: 5, height: 5, depth: 5 };
      const transformed = transformBlueprintBlocks(blocks, dimensions, [-10, 64, 50], 0);

      expect(transformed[0].worldPos).toEqual([-10, 64, 50]);
      expect(transformed[1].worldPos).toEqual([-8, 65, 53]);
    });
  });

  describe('checkWorldHeightBounds', () => {
    it('generates error warning when below -64 or above 319', () => {
      const warnBelow = checkWorldHeightBounds({ min: [0, -70, 0], max: [5, -10, 5] });
      expect(warnBelow.some((w) => w.severity === 'error' && w.message.includes('-64'))).toBe(true);

      const warnAbove = checkWorldHeightBounds({ min: [0, 310, 0], max: [5, 330, 5] });
      expect(warnAbove.some((w) => w.severity === 'error' && w.message.includes('319'))).toBe(true);
    });

    it('produces no error warnings for safe world heights (e.g. 64 to 80)', () => {
      const warnings = checkWorldHeightBounds({ min: [0, 64, 0], max: [5, 75, 5] });
      expect(warnings.filter((w) => w.severity === 'error')).toHaveLength(0);
    });
  });
});
