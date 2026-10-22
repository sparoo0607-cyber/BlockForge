import type { BuildBlueprint, BlockPlacement } from '../../types/blueprint';

function buildWatchtowerBlocks(): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];

  // Foundation & Base (Y=0, 5x5 cobblestone platform)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      blocks.push({
        pos: [x, 0, z],
        block: (x === 0 || x === 4 || z === 0 || z === 4) ? 'minecraft:cobblestone' : 'minecraft:stone_bricks',
      });
    }
  }

  // Shaft walls (Y=1 to Y=6)
  for (let y = 1; y <= 6; y++) {
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const isBorder = x === 0 || x === 4 || z === 0 || z === 4;
        if (!isBorder) continue;

        const isEntrance = y <= 2 && x === 2 && z === 4; // Door opening at South
        const isSlitNorth = (y === 3 || y === 5) && x === 2 && z === 0;
        const isSlitEast = (y === 3 || y === 5) && x === 4 && z === 2;
        const isSlitWest = (y === 3 || y === 5) && x === 0 && z === 2;

        if (isEntrance) {
          // Open entranceway
          continue;
        }

        if (isSlitNorth || isSlitEast || isSlitWest) {
          blocks.push({
            pos: [x, y, z],
            block: 'minecraft:iron_bars',
          });
        } else {
          // Alternating stone bricks and cobblestone for weathered texture
          const useCobble = (x + y + z) % 3 === 0;
          blocks.push({
            pos: [x, y, z],
            block: useCobble ? 'minecraft:cobblestone' : 'minecraft:stone_bricks',
          });
        }
      }
    }
  }

  // Interior ladders or landing floor at Y=6
  for (let x = 1; x <= 3; x++) {
    for (let z = 1; z <= 3; z++) {
      blocks.push({
        pos: [x, 6, z],
        block: 'minecraft:spruce_planks',
      });
    }
  }

  // Observation platform overhang (Y=7, 5x5 spruce planks deck)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      blocks.push({
        pos: [x, 7, z],
        block: 'minecraft:spruce_planks',
      });
    }
  }

  // Battlements & Crenellations (Y=8)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      const isBorder = x === 0 || x === 4 || z === 0 || z === 4;
      if (!isBorder) continue;

      const isCrenel = (x % 2 === 0 && (z === 0 || z === 4)) || (z % 2 === 0 && (x === 0 || x === 4));
      if (isCrenel) {
        blocks.push({
          pos: [x, 8, z],
          block: 'minecraft:stone_bricks',
        });
      } else {
        blocks.push({
          pos: [x, 8, z],
          block: 'minecraft:spruce_fence',
        });
      }
    }
  }

  // Corner watch posts and lanterns (Y=9)
  const cornerCoords: [number, number][] = [[0, 0], [4, 0], [0, 4], [4, 4]];
  for (const [cx, cz] of cornerCoords) {
    blocks.push({
      pos: [cx, 9, cz],
      block: 'minecraft:lantern',
      states: { hanging: false },
    });
  }

  return blocks;
}

export const medievalWatchtowerBlueprint: BuildBlueprint = {
  id: 'medieval-watchtower',
  slug: 'medieval-watchtower',
  name: 'Medieval Watchtower',
  description: 'A fortified 10-block high defensive outpost constructed from stone bricks and cobblestone, featuring arrow slit windows, an overhanging spruce observation deck, and corner battlements with lanterns.',
  category: 'Towers',
  dimensions: { width: 5, height: 10, depth: 5 },
  origin: [0, 0, 0],
  blocks: buildWatchtowerBlocks(),
  supportedEditions: ['java', 'bedrock'],
  estimatedBlockCount: 132,
  difficulty: 'Intermediate',
  tags: ['Medieval', 'Defense', 'Tower', 'Stone', 'Fortress'],
  prerequisites: 'Cheats enabled.',
  limitations: 'Ensure 10 blocks of vertical air space above the target coordinates.',
  accentColor: '#70777A',
};
