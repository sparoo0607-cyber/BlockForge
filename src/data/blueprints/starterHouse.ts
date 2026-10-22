import type { BuildBlueprint, BlockPlacement } from '../../types/blueprint';

function buildStarterHouseBlocks(): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];

  // Floor (Y=0, 5x5)
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 5; z++) {
      const isBorder = x === 0 || x === 4 || z === 0 || z === 4;
      blocks.push({
        pos: [x, 0, z],
        block: isBorder ? 'minecraft:cobblestone' : 'minecraft:oak_planks',
      });
    }
  }

  // Walls Y=1 and Y=2
  for (let y = 1; y <= 2; y++) {
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        const isBorder = x === 0 || x === 4 || z === 0 || z === 4;
        if (!isBorder) continue;

        const isCorner = (x === 0 || x === 4) && (z === 0 || z === 4);
        const isDoor = x === 2 && z === 4;
        const isWindow = (x === 2 && z === 0) || (x === 0 && z === 2) || (x === 4 && z === 2);

        if (isDoor) {
          if (y === 1) {
            blocks.push({
              pos: [x, y, z],
              block: 'minecraft:oak_door',
              states: { facing: 'south', half: 'lower' },
            });
          } else {
            blocks.push({
              pos: [x, y, z],
              block: 'minecraft:oak_door',
              states: { facing: 'south', half: 'upper' },
            });
          }
        } else if (isCorner) {
          blocks.push({
            pos: [x, y, z],
            block: 'minecraft:oak_log',
            states: { axis: 'y' },
          });
        } else if (isWindow && y === 1) {
          blocks.push({
            pos: [x, y, z],
            block: 'minecraft:glass_pane',
          });
        } else {
          blocks.push({
            pos: [x, y, z],
            block: 'minecraft:oak_planks',
          });
        }
      }
    }
  }

  // Y=3: Ceiling & Lower Roof Eaves
  // North and South eaves (Z=0 and Z=4)
  for (let x = 0; x < 5; x++) {
    blocks.push({
      pos: [x, 3, 0],
      block: 'minecraft:oak_stairs',
      states: { facing: 'south', half: 'bottom' },
    });
    blocks.push({
      pos: [x, 3, 4],
      block: 'minecraft:oak_stairs',
      states: { facing: 'north', half: 'bottom' },
    });
  }

  // East and West gable walls (X=0 and X=4, for Z=1..3)
  for (let z = 1; z <= 3; z++) {
    blocks.push({ pos: [0, 3, z], block: 'minecraft:oak_planks' });
    blocks.push({ pos: [4, 3, z], block: 'minecraft:oak_planks' });
  }

  // Interior ceiling (X=1..3, Z=1..3)
  for (let x = 1; x <= 3; x++) {
    for (let z = 1; z <= 3; z++) {
      if (x === 2 && z === 2) {
        // Center lantern hanging
        blocks.push({
          pos: [x, 3, z],
          block: 'minecraft:lantern',
          states: { hanging: true },
        });
      } else {
        blocks.push({
          pos: [x, 3, z],
          block: 'minecraft:oak_planks',
        });
      }
    }
  }

  // Y=4: Roof Peak
  for (let x = 0; x < 5; x++) {
    blocks.push({
      pos: [x, 4, 1],
      block: 'minecraft:oak_stairs',
      states: { facing: 'south', half: 'bottom' },
    });
    blocks.push({
      pos: [x, 4, 3],
      block: 'minecraft:oak_stairs',
      states: { facing: 'north', half: 'bottom' },
    });
    blocks.push({
      pos: [x, 4, 2],
      block: 'minecraft:oak_slab',
      states: { type: 'bottom' },
    });
  }

  return blocks;
}

export const starterHouseBlueprint: BuildBlueprint = {
  id: 'compact-starter-house',
  slug: 'compact-starter-house',
  name: 'Compact Starter House',
  description: 'A cozy 5x5 survival starter home featuring an oak log frame, plank walls, glass pane windows, a hanging lantern, and a gabled wooden roof.',
  category: 'Houses',
  dimensions: { width: 5, height: 5, depth: 5 },
  origin: [0, 0, 0],
  blocks: buildStarterHouseBlocks(),
  supportedEditions: ['java', 'bedrock'],
  estimatedBlockCount: 78,
  difficulty: 'Starter',
  tags: ['Starter', 'Survival', 'House', 'Oak', 'Cozy'],
  prerequisites: 'Cheats enabled (/fill and /setblock permissions).',
  limitations: 'Ensure flat ground at the placement coordinates.',
  accentColor: '#A37748',
};
