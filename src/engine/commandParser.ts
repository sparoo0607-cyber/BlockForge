import type { BlockPlacement, BuildDimensions } from '../types/blueprint';

export interface CommandParseResult {
  blocks: BlockPlacement[];
  dimensions: BuildDimensions;
  errors: string[];
}

/**
 * Parses raw /fill and /setblock Minecraft commands into local BlockPlacement[]
 * Example:
 * /fill 0 0 0 4 0 4 minecraft:cobblestone
 * /setblock 2 1 0 minecraft:oak_door[facing=south,half=lower]
 */
export function parseMinecraftCommands(commandText: string): CommandParseResult {
  const lines = commandText.split('\n');
  const blocksMap = new Map<string, BlockPlacement>();
  const errors: string[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('#')) continue;

    // Remove leading slash if present
    const line = rawLine.startsWith('/') ? rawLine.slice(1) : rawLine;
    const parts = line.split(/\s+/);
    const cmd = parts[0]?.toLowerCase();

    if (cmd === 'setblock') {
      // setblock <x> <y> <z> <block>[states]
      if (parts.length < 5) {
        errors.push(`Line ${i + 1}: Incomplete /setblock command`);
        continue;
      }
      const x = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const z = parseInt(parts[3], 10);
      const blockRaw = parts.slice(4).join(' ');

      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        errors.push(`Line ${i + 1}: Coordinates must be integers`);
        continue;
      }

      const { block, states } = parseBlockDescriptor(blockRaw);
      const key = `${x},${y},${z}`;
      blocksMap.set(key, { pos: [x, y, z], block, states });

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    } else if (cmd === 'fill') {
      // fill <x1> <y1> <z1> <x2> <y2> <z2> <block>
      if (parts.length < 8) {
        errors.push(`Line ${i + 1}: Incomplete /fill command`);
        continue;
      }
      const x1 = parseInt(parts[1], 10);
      const y1 = parseInt(parts[2], 10);
      const z1 = parseInt(parts[3], 10);
      const x2 = parseInt(parts[4], 10);
      const y2 = parseInt(parts[5], 10);
      const z2 = parseInt(parts[6], 10);
      const blockRaw = parts.slice(7).join(' ');

      if ([x1, y1, z1, x2, y2, z2].some(isNaN)) {
        errors.push(`Line ${i + 1}: /fill coordinates must be integers`);
        continue;
      }

      const { block, states } = parseBlockDescriptor(blockRaw);
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      const startZ = Math.min(z1, z2);
      const endZ = Math.max(z1, z2);

      for (let y = startY; y <= endY; y++) {
        for (let z = startZ; z <= endZ; z++) {
          for (let x = startX; x <= endX; x++) {
            const key = `${x},${y},${z}`;
            blocksMap.set(key, { pos: [x, y, z], block, states });
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
          }
        }
      }
    }
  }

  const rawBlocks = Array.from(blocksMap.values());
  if (rawBlocks.length === 0) {
    return {
      blocks: [],
      dimensions: { width: 5, height: 5, depth: 5 },
      errors,
    };
  }

  // Normalize so lowest corner starts at [0, 0, 0]
  const offsetX = minX;
  const offsetY = minY;
  const offsetZ = minZ;

  const normalizedBlocks: BlockPlacement[] = rawBlocks.map((b) => ({
    pos: [b.pos[0] - offsetX, b.pos[1] - offsetY, b.pos[2] - offsetZ],
    block: b.block,
    states: b.states,
  }));

  const dimensions: BuildDimensions = {
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    depth: maxZ - minZ + 1,
  };

  return {
    blocks: normalizedBlocks,
    dimensions,
    errors,
  };
}

function parseBlockDescriptor(desc: string): { block: string; states?: Record<string, string | number | boolean> } {
  let trimmed = desc.trim();
  // Strip replace/keep/destroy flags if present at end of /fill
  trimmed = trimmed.replace(/\s+(replace|outline|hollow|destroy|keep)(\s+.*)?$/i, '').trim();

  // Handle Java brackets: e.g. oak_stairs[facing=north,half=bottom]
  const bracketMatch = trimmed.match(/^([a-z0-9_:]+)\[(.*)\]$/i);
  if (bracketMatch) {
    const rawBlock = bracketMatch[1];
    const rawStates = bracketMatch[2];
    const block = rawBlock.includes(':') ? rawBlock : `minecraft:${rawBlock}`;
    const states: Record<string, string | number | boolean> = {};

    rawStates.split(',').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v) {
        if (v === 'true') states[k.trim()] = true;
        else if (v === 'false') states[k.trim()] = false;
        else if (!isNaN(Number(v))) states[k.trim()] = Number(v);
        else states[k.trim()] = v.trim();
      }
    });

    return { block, states };
  }

  // Handle standard block
  const block = trimmed.includes(':') ? trimmed : `minecraft:${trimmed}`;
  return { block };
}
