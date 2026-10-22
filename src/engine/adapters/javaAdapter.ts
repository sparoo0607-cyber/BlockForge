import type { Position, BlockStates, GeneratedCommand } from '../../types/blueprint';

export class JavaCommandAdapter {
  readonly edition = 'java' as const;
  readonly maxFillVolume = 32768;

  /**
   * Formats a Java block descriptor with states: e.g., "minecraft:oak_stairs[facing=north,half=bottom]"
   */
  formatBlock(blockName: string, states?: BlockStates): string {
    const namespaced = blockName.includes(':') ? blockName : `minecraft:${blockName}`;
    if (!states || Object.keys(states).length === 0) {
      return namespaced;
    }

    const stateEntries = Object.entries(states)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');

    return `${namespaced}[${stateEntries}]`;
  }

  /**
   * Generates a Java /fill command for a cuboid region
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
      description: `Fill ${calcVolume} blocks of ${block}`,
    };
  }

  /**
   * Generates a Java /setblock command for an individual block
   */
  generateSetblock(pos: Position, block: string, states?: BlockStates): GeneratedCommand {
    const blockDescriptor = this.formatBlock(block, states);
    const [x, y, z] = pos;

    return {
      type: 'setblock',
      command: `/setblock ${x} ${y} ${z} ${blockDescriptor}`,
      blockCount: 1,
      description: `Place ${block} at ${x}, ${y}, ${z}`,
    };
  }
}
