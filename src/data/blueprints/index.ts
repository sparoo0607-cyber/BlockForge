import type { BuildBlueprint, Edition } from '../../types/blueprint';
import { starterHouseBlueprint } from './starterHouse';
import { medievalWatchtowerBlueprint } from './medievalWatchtower';
import { stoneCastleBlueprint } from './stoneCastle';
import { gardenBridgeBlueprint } from './gardenBridge';
import { modernHouseBlueprint } from './modernHouse';

export const ALL_BLUEPRINTS: BuildBlueprint[] = [
  starterHouseBlueprint,
  medievalWatchtowerBlueprint,
  stoneCastleBlueprint,
  gardenBridgeBlueprint,
  modernHouseBlueprint,
];

export const BLUEPRINT_CATEGORIES = [
  'All',
  'Houses',
  'Castles',
  'Towers',
  'Bridges',
  'Modern Builds',
] as const;

export type BlueprintCategory = (typeof BLUEPRINT_CATEGORIES)[number];

export function getBlueprintBySlug(slug: string): BuildBlueprint | undefined {
  return ALL_BLUEPRINTS.find((b) => b.slug === slug);
}

export function filterBlueprints(options: {
  search?: string;
  category?: BlueprintCategory;
  edition?: Edition | 'all';
  sortBy?: 'name' | 'size-asc' | 'size-desc' | 'difficulty';
}): BuildBlueprint[] {
  const { search = '', category = 'All', edition = 'all', sortBy = 'name' } = options;
  const q = search.trim().toLowerCase();

  return ALL_BLUEPRINTS.filter((bp) => {
    // Search match
    if (q) {
      const matchName = bp.name.toLowerCase().includes(q);
      const matchDesc = bp.description.toLowerCase().includes(q);
      const matchTag = bp.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }

    // Category match
    if (category !== 'All' && bp.category !== category) {
      return false;
    }

    // Edition match
    if (edition !== 'all' && !bp.supportedEditions.includes(edition)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    const volA = a.dimensions.width * a.dimensions.height * a.dimensions.depth;
    const volB = b.dimensions.width * b.dimensions.height * b.dimensions.depth;
    if (sortBy === 'size-asc') return volA - volB;
    if (sortBy === 'size-desc') return volB - volA;
    if (sortBy === 'difficulty') {
      const order = { Starter: 1, Intermediate: 2, Advanced: 3 };
      return order[a.difficulty] - order[b.difficulty];
    }
    return 0;
  });
}
