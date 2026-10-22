import type { BuildBlueprint, BlockPlacement } from '../types/blueprint'

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBlueprint(blueprint: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!blueprint || typeof blueprint !== 'object') {
    return { valid: false, errors: ['Blueprint must be a non-null object'], warnings: [] };
  }

  const bp = blueprint as Partial<BuildBlueprint>;

  // Validate ID and Slug
  if (!bp.id || typeof bp.id !== 'string' || bp.id.trim() === '') {
    errors.push('Blueprint ID must be a non-empty string');
  }
  if (!bp.slug || typeof bp.slug !== 'string' || !/^[a-z0-9-]+$/.test(bp.slug)) {
    errors.push('Blueprint slug must contain only lowercase alphanumeric characters and hyphens');
  }

  // Validate Name and Description
  if (!bp.name || typeof bp.name !== 'string') {
    errors.push('Blueprint name is required');
  }
  if (!bp.description || typeof bp.description !== 'string') {
    errors.push('Blueprint description is required');
  }

  // Validate Dimensions
  if (!bp.dimensions || typeof bp.dimensions !== 'object') {
    errors.push('Blueprint dimensions must be specified');
  } else {
    const { width, height, depth } = bp.dimensions;
    if (!Number.isInteger(width) || width <= 0) {
      errors.push(`Invalid width: ${width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(height) || height <= 0) {
      errors.push(`Invalid height: ${height}. Must be a positive integer.`);
    }
    if (!Number.isInteger(depth) || depth <= 0) {
      errors.push(`Invalid depth: ${depth}. Must be a positive integer.`);
    }
  }

  // Validate Origin
  if (!Array.isArray(bp.origin) || bp.origin.length !== 3 || !bp.origin.every(Number.isInteger)) {
    errors.push('Origin must be a 3D coordinate array of integers [x, y, z]');
  }

  // Validate Supported Editions
  if (!Array.isArray(bp.supportedEditions) || bp.supportedEditions.length === 0) {
    errors.push('supportedEditions must be a non-empty array');
  } else {
    for (const edition of bp.supportedEditions) {
      if (edition !== 'java' && edition !== 'bedrock') {
        errors.push(`Unknown edition: ${edition}. Must be 'java' or 'bedrock'.`);
      }
    }
  }

  // Validate Blocks
  if (!Array.isArray(bp.blocks) || bp.blocks.length === 0) {
    errors.push('Blueprint must contain at least one block placement');
  } else {
    const seenCoordinates = new Set<string>();
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;

    bp.blocks.forEach((blockPlacement: BlockPlacement, index: number) => {
      if (!blockPlacement || typeof blockPlacement !== 'object') {
        errors.push(`Block at index ${index} is invalid`);
        return;
      }

      const { pos, block, states } = blockPlacement;

      // Validate position
      if (!Array.isArray(pos) || pos.length !== 3 || !pos.every(Number.isInteger)) {
        errors.push(`Block at index ${index} has invalid pos: ${JSON.stringify(pos)}`);
        return;
      }

      const [x, y, z] = pos;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);

      // Check duplicate placements
      const key = `${x},${y},${z}`;
      if (seenCoordinates.has(key)) {
        errors.push(`Duplicate block placement at position (${x}, ${y}, ${z})`);
      }
      seenCoordinates.add(key);

      // Validate block identifier
      if (!block || typeof block !== 'string' || block.trim() === '') {
        errors.push(`Block at index ${index} has empty or non-string identifier`);
      } else if (!block.includes(':') && !block.startsWith('minecraft:')) {
        warnings.push(`Block "${block}" does not have a namespace prefix; "minecraft:" is recommended.`);
      }

      // Validate states if present
      if (states !== undefined && (typeof states !== 'object' || states === null || Array.isArray(states))) {
        errors.push(`Block at index ${index} has invalid states object`);
      }
    });

    // Check if blocks fit within declared dimensions
    if (bp.dimensions && errors.length === 0) {
      const { width, height, depth } = bp.dimensions;
      if (minX < 0 || minY < 0 || minZ < 0) {
        errors.push(`Block placements have negative local coordinates: min=(${minX}, ${minY}, ${minZ}). Local coords must start at 0 or origin.`);
      }
      if (maxX >= width) {
        errors.push(`Block placement X (${maxX}) exceeds declared width (${width})`);
      }
      if (maxY >= height) {
        errors.push(`Block placement Y (${maxY}) exceeds declared height (${height})`);
      }
      if (maxZ >= depth) {
        errors.push(`Block placement Z (${maxZ}) exceeds declared depth (${depth})`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
