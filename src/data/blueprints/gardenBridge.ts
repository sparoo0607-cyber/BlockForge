import type { BuildBlueprint, BlockPlacement } from '../../types/blueprint';

function buildGardenBridgeBlocks(): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];

  // Pier Foundations at Z=0..1 and Z=7..8 (Y=0)
  for (let x = 0; x < 5; x++) {
    for (const z of [0, 1, 7, 8]) {
      blocks.push({
        pos: [x, 0, z],
        block: (x === 0 || x === 4) ? 'minecraft:cobblestone' : 'minecraft:stone_bricks',
      });
    }
  }

  // Walkway Profile:
  // Z=0, Z=8: Y=1 (spruce planks)
  // Z=1, Z=7: Y=1 (spruce stairs stepping up)
  // Z=2..6: Y=2 (spruce planks arch deck)
  for (let x = 1; x <= 3; x++) {
    // Ends
    blocks.push({ pos: [x, 1, 0], block: 'minecraft:spruce_planks' });
    blocks.push({ pos: [x, 1, 8], block: 'minecraft:spruce_planks' });

    // Step up
    blocks.push({
      pos: [x, 1, 1],
      block: 'minecraft:spruce_stairs',
      states: { facing: 'south', half: 'bottom' },
    });
    blocks.push({
      pos: [x, 1, 7],
      block: 'minecraft:spruce_stairs',
      states: { facing: 'north', half: 'bottom' },
    });

    // Elevated bridge span (Z=2..6, Y=2)
    for (let z = 2; z <= 6; z++) {
      blocks.push({ pos: [x, 2, z], block: 'minecraft:spruce_planks' });
    }
  }

  // Bridge Stone Arch Underpinning (supporting beams)
  for (const z of [2, 6]) {
    blocks.push({ pos: [0, 1, z], block: 'minecraft:stone_bricks' });
    blocks.push({ pos: [4, 1, z], block: 'minecraft:stone_bricks' });
  }

  // Railings on sides (X=0 and X=4)
  for (const x of [0, 4]) {
    // Z=0,8: fence at Y=2
    blocks.push({ pos: [x, 2, 0], block: 'minecraft:spruce_fence' });
    blocks.push({ pos: [x, 2, 8], block: 'minecraft:spruce_fence' });

    // Z=1..7: fence railing at Y=3
    for (let z = 1; z <= 7; z++) {
      blocks.push({ pos: [x, 3, z], block: 'minecraft:spruce_fence' });
    }

    // Lanterns atop center bridge posts (Z=4, Y=4)
    blocks.push({
      pos: [x, 4, 4],
      block: 'minecraft:lantern',
      states: { hanging: false },
    });
  }

  // Garden leaf accents on pier corners
  for (const x of [0, 4]) {
    for (const z of [0, 8]) {
      blocks.push({ pos: [x, 1, z], block: 'minecraft:oak_leaves' });
    }
  }

  return blocks;
}

export const gardenBridgeBlueprint: BuildBlueprint = {
  id: 'garden-bridge',
  slug: 'garden-bridge',
  name: 'Garden Bridge',
  description: 'An elegant 9-block arched footbridge built with spruce planks, stone brick supports, spruce fence railings, lush oak leaf accents, and ambient lanterns.',
  category: 'Bridges',
  dimensions: { width: 5, height: 5, depth: 9 },
  origin: [0, 0, 0],
  blocks: buildGardenBridgeBlocks(),
  supportedEditions: ['java', 'bedrock'],
  estimatedBlockCount: 65,
  difficulty: 'Starter',
  tags: ['Bridge', 'Garden', 'Spruce', 'Aesthetic', 'Path'],
  prerequisites: 'Cheats enabled.',
  limitations: 'Designed to span a 5-block wide gap or water stream.',
  accentColor: '#5B8C4B',
};
