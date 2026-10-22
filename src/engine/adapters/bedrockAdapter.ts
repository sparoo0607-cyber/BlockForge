import type { Position, BlockStates, GeneratedCommand } from '../../types/blueprint';

/**
 * Maps Java-style state names and values to Bedrock-native state representations
 */
function mapJavaToBedrockStates(blockName: string, states?: BlockStates): string | undefined {
  if (!states || Object.keys(states).length === 0) {
    return undefined;
  }

  const cleanName = blockName.replace('minecraft:', '');

  // Stairs mapping
  if (cleanName.endsWith('_stairs')) {
    const weirdoMap: Record<string, number> = {
      east: 0,
      west: 1,
      south: 2,
      north: 3,
    };
    const facing = typeof states.facing === 'string' ? states.facing.toLowerCase() : 'north';
    const weirdoDir = weirdoMap[facing] ?? 3;
    const upsideDown = states.half === 'top';

    return `["weirdo_direction": ${weirdoDir}, "upside_down_bit": ${upsideDown}]`;
  }

  // Lantern mapping
  if (cleanName === 'lantern' || cleanName === 'soul_lantern') {
    const hanging = states.hanging === true || states.hanging === 'true';
    return `["hanging": ${hanging}]`;
  }

  // Slab mapping
  if (cleanName.endsWith('_slab')) {
    const isTop = states.type === 'top' || states.half === 'top';
    return `["minecraft:vertical_half": "${isTop ? 'top' : 'bottom'}"]`;
  }

  // Trapdoor mapping
  if (cleanName.endsWith('_trapdoor')) {
    const directionMap: Record<string, number> = { south: 0, west: 1, north: 2, east: 3 };
    const facing = typeof states.facing === 'string' ? states.facing.toLowerCase() : 'north';
    const dir = directionMap[facing] ?? 2;
    const isTop = states.half === 'top';
    const isOpen = states.open === true || states.open === 'true';
    return `["direction": ${dir}, "upside_down_bit": ${isTop}, "open_bit": ${isOpen}]`;
  }

  // Door mapping
  if (cleanName.endsWith('_door')) {
    const directionMap: Record<string, number> = { south: 0, west: 1, north: 2, east: 3 };
    const facing = typeof states.facing === 'string' ? states.facing.toLowerCase() : 'north';
    const dir = directionMap[facing] ?? 2;
    const isUpper = states.half === 'upper';
    return `["direction": ${dir}, "upper_block_bit": ${isUpper}]`;
  }

  // Generic JSON-like format for modern Bedrock (1.20+)
  const formattedPairs = Object.entries(states)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => {
      if (typeof v === 'boolean' || typeof v === 'number') {
        return `"${k}": ${v}`;
      }
      return `"${k}": "${v}"`;
    });

  return `[${formattedPairs.join(', ')}]`;
}

export class BedrockCommandAdapter {
  readonly edition = 'bedrock' as const;
  readonly maxFillVolume = 32768;

  /**
   * Formats a Bedrock block descriptor with state arguments:
   * e.g., "minecraft:oak_stairs ["weirdo_direction": 3, "upside_down_bit": false]"
   * or "minecraft:oak_planks"
   */
  formatBlock(blockName: string, states?: BlockStates): string {
    const namespaced = blockName.includes(':') ? blockName : `minecraft:${blockName}`;
    const bedrockStates = mapJavaToBedrockStates(namespaced, states);

    if (bedrockStates) {
      return `${namespaced} ${bedrockStates}`;
    }
    return namespaced;
  }

  /**
   * Generates a Bedrock /fill command
   */
  generateFill(from: Position, to: Position, block: string, states?: BlockStates, volume?: number): GeneratedCommand {
    const blockDescriptor = this.formatBlock(block, states);
    const [x1, y1, z1] = from;
    const [x2, y2, z2] = to;
    const calcVolume = volume ?? (Math.abs(x2 - x1) + 1) * (Math.abs(y2 - y1) + 1) * (Math.abs(z2 - z1) + 1);

    return {
      type: 'fill',
      command: `/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${blockDescriptor}`,
      blockCount: calcVolume,
      description: `Fill ${calcVolume} blocks of ${block} (Bedrock)`,
    };
  }

  /**
   * Generates a Bedrock /setblock command
   */
  generateSetblock(pos: Position, block: string, states?: BlockStates): GeneratedCommand {
    const blockDescriptor = this.formatBlock(block, states);
    const [x, y, z] = pos;

    return {
      type: 'setblock',
      command: `/setblock ${x} ${y} ${z} ${blockDescriptor}`,
      blockCount: 1,
      description: `Place ${block} at ${x}, ${y}, ${z} (Bedrock)`,
    };
  }
}
