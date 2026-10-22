import type {
  Position,
  RotationAngle,
  BuildDimensions,
  BoundingBox,
  BlockPlacement,
  TransformedBlock,
  BlockStates,
  GenerationWarning,
} from '../types/blueprint';

/**
 * Direction rotation mapping for block states (stairs, doors, chests, lanterns, etc.)
 */
const FACING_CLOCKWISE_90: Record<string, string> = {
  north: 'east',
  east: 'south',
  south: 'west',
  west: 'north',
  up: 'up',
  down: 'down',
};

const FACING_180: Record<string, string> = {
  north: 'south',
  east: 'west',
  south: 'north',
  west: 'east',
  up: 'up',
  down: 'down',
};

const FACING_270: Record<string, string> = {
  north: 'west',
  east: 'north',
  south: 'east',
  west: 'south',
  up: 'up',
  down: 'down',
};

export function rotateBlockStates(states: BlockStates | undefined, angle: RotationAngle): BlockStates | undefined {
  if (!states) return undefined;
  if (angle === 0) return { ...states };

  const rotated: BlockStates = { ...states };

  // Handle facing direction
  if (typeof rotated.facing === 'string') {
    const f = rotated.facing.toLowerCase();
    if (angle === 90) rotated.facing = FACING_CLOCKWISE_90[f] ?? f;
    else if (angle === 180) rotated.facing = FACING_180[f] ?? f;
    else if (angle === 270) rotated.facing = FACING_270[f] ?? f;
  }

  // Handle axis orientation (logs, pillars, chains)
  if (typeof rotated.axis === 'string') {
    const ax = rotated.axis.toLowerCase();
    if (angle === 90 || angle === 270) {
      if (ax === 'x') rotated.axis = 'z';
      else if (ax === 'z') rotated.axis = 'x';
    }
  }

  return rotated;
}

/**
 * Computes the transformed dimensions after rotation
 */
export function getRotatedDimensions(dimensions: BuildDimensions, angle: RotationAngle): BuildDimensions {
  if (angle === 90 || angle === 270) {
    return {
      width: dimensions.depth,
      height: dimensions.height,
      depth: dimensions.width,
    };
  }
  return { ...dimensions };
}

/**
 * Rotates a local block position [x, y, z] within a bounding box of given dimensions
 */
export function rotateLocalPosition(
  pos: Position,
  dimensions: BuildDimensions,
  angle: RotationAngle
): Position {
  const [x, y, z] = pos;
  const { width, depth } = dimensions;

  switch (angle) {
    case 0:
      return [x, y, z];
    case 90:
      // 90° Clockwise: X' = (depth - 1) - Z, Z' = X
      return [(depth - 1) - z, y, x];
    case 180:
      // 180°: X' = (width - 1) - X, Z' = (depth - 1) - Z
      return [(width - 1) - x, y, (depth - 1) - z];
    case 270:
      // 270° Clockwise: X' = Z, Z' = (width - 1) - X
      return [z, y, (width - 1) - x];
    default:
      return [x, y, z];
  }
}

/**
 * Validates and converts user coordinate input to safe integers
 */
export function parseCoordinateInput(value: unknown, fieldName: string): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(`${fieldName} coordinate must be a valid integer. Received: ${value}`);
    }
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      throw new Error(`${fieldName} coordinate cannot be empty`);
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new Error(`${fieldName} coordinate must be an integer. Received "${value}"`);
    }
    return parsed;
  }

  throw new Error(`${fieldName} coordinate must be a number or numeric string`);
}

/**
 * Calculates the bounding box in world space
 */
export function calculateBoundingBox(
  targetOrigin: Position,
  rotatedDimensions: BuildDimensions
): BoundingBox {
  const [ox, oy, oz] = targetOrigin;
  return {
    min: [ox, oy, oz],
    max: [
      ox + rotatedDimensions.width - 1,
      oy + rotatedDimensions.height - 1,
      oz + rotatedDimensions.depth - 1,
    ],
  };
}

/**
 * Checks world height limits and returns actionable warnings
 */
export function checkWorldHeightBounds(boundingBox: BoundingBox): GenerationWarning[] {
  const warnings: GenerationWarning[] = [];
  const minY = boundingBox.min[1];
  const maxY = boundingBox.max[1];

  if (minY < -64) {
    warnings.push({
      type: 'height_warning',
      severity: 'error',
      message: `Minimum Y coordinate (${minY}) is below Minecraft's void limit (-64). Blocks below Y=-64 will fail to generate.`,
    });
  } else if (minY < 0) {
    warnings.push({
      type: 'height_warning',
      severity: 'info',
      message: `Build extends below Y=0 (into deepslate layers: ${minY} to 0). This is supported in Minecraft 1.18+.`,
    });
  }

  if (maxY > 319) {
    warnings.push({
      type: 'height_warning',
      severity: 'error',
      message: `Maximum Y coordinate (${maxY}) exceeds Minecraft's build height limit (319). Blocks above Y=319 cannot be placed.`,
    });
  } else if (maxY > 255) {
    warnings.push({
      type: 'height_warning',
      severity: 'info',
      message: `Build reaches Y=${maxY} (>255). This requires Minecraft 1.18+ (Caves & Cliffs) world height.`,
    });
  }

  return warnings;
}

/**
 * Transforms all blocks in a blueprint by rotating and translating to world space
 */
export function transformBlueprintBlocks(
  blocks: BlockPlacement[],
  dimensions: BuildDimensions,
  targetOrigin: Position,
  angle: RotationAngle
): TransformedBlock[] {
  const [ox, oy, oz] = targetOrigin;

  return blocks.map((b) => {
    const rotatedLocal = rotateLocalPosition(b.pos, dimensions, angle);
    const worldPos: Position = [
      ox + rotatedLocal[0],
      oy + rotatedLocal[1],
      oz + rotatedLocal[2],
    ];
    const rotatedStates = rotateBlockStates(b.states, angle);

    return {
      worldPos,
      localPos: rotatedLocal,
      block: b.block,
      states: rotatedStates,
    };
  });
}
