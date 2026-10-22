import type { BuildBlueprint, BlockPlacement } from '../../types/blueprint';

function buildModernHouseBlocks(): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];

  // Ground Floor Foundation (Y=0, 7x7 smooth quartz)
  for (let x = 0; x < 7; x++) {
    for (let z = 0; z < 7; z++) {
      blocks.push({
        pos: [x, 0, z],
        block: (x === 0 || z === 0) ? 'minecraft:gray_concrete' : 'minecraft:smooth_quartz',
      });
    }
  }

  // Ground Floor Walls (Y=1 & Y=2)
  for (let y = 1; y <= 2; y++) {
    for (let x = 0; x < 7; x++) {
      for (let z = 0; z < 7; z++) {
        const isBorder = x === 0 || x === 6 || z === 0 || z === 6;
        if (!isBorder) continue;

        // Gray accent wall along X=0
        if (x === 0) {
          blocks.push({ pos: [x, y, z], block: 'minecraft:gray_concrete' });
          continue;
        }

        // Back wall along Z=0
        if (z === 0) {
          blocks.push({ pos: [x, y, z], block: 'minecraft:white_concrete' });
          continue;
        }

        // Front facade at Z=6
        if (z === 6) {
          if (x === 2 && y === 1) {
            // Front door
            blocks.push({
              pos: [x, y, z],
              block: 'minecraft:spruce_door',
              states: { facing: 'south', half: 'lower' },
            });
          } else if (x === 2 && y === 2) {
            blocks.push({
              pos: [x, y, z],
              block: 'minecraft:spruce_door',
              states: { facing: 'south', half: 'upper' },
            });
          } else if (x >= 3 && x <= 5) {
            // Panoramic window
            blocks.push({ pos: [x, y, z], block: 'minecraft:glass_pane' });
          } else {
            blocks.push({ pos: [x, y, z], block: 'minecraft:smooth_quartz' });
          }
          continue;
        }

        // Side wall at X=6
        if (x === 6) {
          if (z >= 2 && z <= 4) {
            blocks.push({ pos: [x, y, z], block: 'minecraft:glass_pane' });
          } else {
            blocks.push({ pos: [x, y, z], block: 'minecraft:white_concrete' });
          }
        }
      }
    }
  }

  // Mid-floor ceiling / Second floor deck (Y=3, 7x7)
  for (let x = 0; x < 7; x++) {
    for (let z = 0; z < 7; z++) {
      blocks.push({ pos: [x, 3, z], block: 'minecraft:smooth_quartz' });
    }
  }

  // Upper Floor Cantilever Walls (Y=4 & Y=5)
  // Cantilevered overhang on front (X=1..6, Z=2..6)
  for (let y = 4; y <= 5; y++) {
    for (let x = 1; x <= 6; x++) {
      for (let z = 2; z <= 6; z++) {
        const isUpperBorder = x === 1 || x === 6 || z === 2 || z === 6;
        if (!isUpperBorder) continue;

        // Skip corner at Y=5 for lantern placement
        if (y === 5 && x === 1 && z === 6) {
          continue;
        }

        // Big picture window on upper front (Z=6, X=2..5)
        if (z === 6 && x >= 2 && x <= 5) {
          blocks.push({ pos: [x, y, z], block: 'minecraft:glass_pane' });
        } else {
          blocks.push({ pos: [x, y, z], block: 'minecraft:white_concrete' });
        }
      }
    }
  }

  // Roof Terrace Cap (Y=5 inside)
  for (let x = 1; x <= 6; x++) {
    for (let z = 2; z <= 6; z++) {
      if (x === 1 || x === 6 || z === 2 || z === 6) {
        // Terrace edge
        continue;
      }
      blocks.push({ pos: [x, 5, z], block: 'minecraft:smooth_quartz' });
    }
  }

  // Terrace lantern at corner (Y=5)
  blocks.push({
    pos: [1, 5, 6],
    block: 'minecraft:lantern',
    states: { hanging: false },
  });

  return blocks;
}

export const modernHouseBlueprint: BuildBlueprint = {
  id: 'modern-minimalist-house',
  slug: 'modern-minimalist-house',
  name: 'Modern Minimalist House',
  description: 'An architectural 7x7 two-story residence showcasing smooth quartz foundations, a charcoal gray accent wall, floor-to-ceiling panoramic glass, and a cantilevered white concrete upper suite.',
  category: 'Modern Builds',
  dimensions: { width: 7, height: 6, depth: 7 },
  origin: [0, 0, 0],
  blocks: buildModernHouseBlocks(),
  supportedEditions: ['java', 'bedrock'],
  estimatedBlockCount: 154,
  difficulty: 'Intermediate',
  tags: ['Modern', 'Minimalist', 'Concrete', 'Quartz', 'Architecture'],
  prerequisites: 'Cheats enabled.',
  limitations: 'Flat building site recommended.',
  accentColor: '#DCE2E6',
};
