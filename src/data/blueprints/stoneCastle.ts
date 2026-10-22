import type { BuildBlueprint, BlockPlacement } from '../../types/blueprint';

function buildStoneCastleBlocks(): BlockPlacement[] {
  const blocks: BlockPlacement[] = [];

  // Helper to check if a 2D coordinate is inside one of the 4 corner towers
  const isCornerTower = (x: number, z: number): boolean => {
    const isNW = x <= 2 && z <= 2;
    const isNE = x >= 6 && z <= 2;
    const isSW = x <= 2 && z >= 6;
    const isSE = x >= 6 && z >= 6;
    return isNW || isNE || isSW || isSE;
  };

  // 1. Foundation / Floor (Y=0, 9x9)
  for (let x = 0; x < 9; x++) {
    for (let z = 0; z < 9; z++) {
      const isTower = isCornerTower(x, z);
      const isOuter = x === 0 || x === 8 || z === 0 || z === 8;
      let block = 'minecraft:stone_bricks';
      if (!isTower && !isOuter) {
        // Courtyard floor
        block = (x + z) % 2 === 0 ? 'minecraft:cobblestone' : 'minecraft:stone_bricks';
      }
      blocks.push({ pos: [x, 0, z], block });
    }
  }

  // 2. Main Walls & Towers (Y=1 to Y=3)
  for (let y = 1; y <= 3; y++) {
    for (let x = 0; x < 9; x++) {
      for (let z = 0; z < 9; z++) {
        const isTower = isCornerTower(x, z);
        const isOuterWall = x === 0 || x === 8 || z === 0 || z === 8;

        if (isTower) {
          // Hollow tower perimeter
          const isTowerBorder = (x === 0 || x === 2 || x === 6 || x === 8) || (z === 0 || z === 2 || z === 6 || z === 8);
          if (isTowerBorder) {
            blocks.push({ pos: [x, y, z], block: 'minecraft:stone_bricks' });
          }
        } else if (isOuterWall) {
          // Curtain wall
          const isGate = z === 8 && (x >= 3 && x <= 5);
          if (isGate) {
            if (x === 4 && (y === 1 || y === 2)) {
              // Portcullis
              blocks.push({ pos: [x, y, z], block: 'minecraft:iron_bars' });
            } else if (y === 3) {
              blocks.push({ pos: [x, y, z], block: 'minecraft:chiseled_stone_bricks' });
            } else {
              blocks.push({ pos: [x, y, z], block: 'minecraft:stone_bricks' });
            }
          } else {
            blocks.push({ pos: [x, y, z], block: 'minecraft:stone_bricks' });
          }
        }
      }
    }
  }

  // 3. Curtain Wall Walkway & Battlements (Y=4)
  for (let x = 0; x < 9; x++) {
    for (let z = 0; z < 9; z++) {
      const isTower = isCornerTower(x, z);
      const isOuterWall = x === 0 || x === 8 || z === 0 || z === 8;

      if (isTower) {
        // Tower walls continue up
        const isTowerBorder = (x === 0 || x === 2 || x === 6 || x === 8) || (z === 0 || z === 2 || z === 6 || z === 8);
        if (isTowerBorder) {
          blocks.push({ pos: [x, 4, z], block: 'minecraft:stone_bricks' });
        }
      } else if (isOuterWall) {
        // Crenellations on curtain wall
        const isCrenel = (x % 2 === 0 && (z === 0 || z === 8)) || (z % 2 === 0 && (x === 0 || x === 8));
        if (isCrenel) {
          blocks.push({ pos: [x, 4, z], block: 'minecraft:stone_bricks' });
        }
      }
    }
  }

  // 4. Tower Platforms (Y=4) and Turret battlements (Y=5)
  for (const [tx, tz] of [[0, 0], [6, 0], [0, 6], [6, 6]]) {
    // Tower roof platform at Y=4 inside
    blocks.push({ pos: [tx + 1, 4, tz + 1], block: 'minecraft:spruce_planks' });

    // Tower battlements at Y=5
    for (let dx = 0; dx < 3; dx++) {
      for (let dz = 0; dz < 3; dz++) {
        const px = tx + dx;
        const pz = tz + dz;
        const isTurretCorner = (dx === 0 || dx === 2) && (dz === 0 || dz === 2);
        if (isTurretCorner) {
          blocks.push({ pos: [px, 5, pz], block: 'minecraft:chiseled_stone_bricks' });
        } else if (dx === 1 && dz === 1) {
          // Center torch or lantern
          blocks.push({ pos: [px, 5, pz], block: 'minecraft:lantern', states: { hanging: false } });
        }
      }
    }
  }

  return blocks;
}

export const stoneCastleBlueprint: BuildBlueprint = {
  id: 'small-stone-castle',
  slug: 'small-stone-castle',
  name: 'Small Stone Castle',
  description: 'A compact 9x9 medieval keep featuring four elevated corner bastions, fortified stone brick curtain walls, crenellations, an interior courtyard, and an iron bars portcullis gateway.',
  category: 'Castles',
  dimensions: { width: 9, height: 6, depth: 9 },
  origin: [0, 0, 0],
  blocks: buildStoneCastleBlocks(),
  supportedEditions: ['java', 'bedrock'],
  estimatedBlockCount: 198,
  difficulty: 'Intermediate',
  tags: ['Castle', 'Medieval', 'Fortress', 'Stone', 'Walls'],
  prerequisites: 'Cheats enabled.',
  limitations: 'Requires a cleared 9x9 area.',
  accentColor: '#888F94',
};
