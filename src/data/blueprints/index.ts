import type { BuildBlueprint, Edition } from '../../types/blueprint';
import { starterHouseBlueprint } from './starterHouse';
import { medievalWatchtowerBlueprint } from './medievalWatchtower';
import { stoneCastleBlueprint } from './stoneCastle';
import { gardenBridgeBlueprint } from './gardenBridge';
import { modernHouseBlueprint } from './modernHouse';
import { getCustomBlueprints } from '../../services/customBuildsStorage';

export const BUILTIN_BLUEPRINTS: BuildBlueprint[] = [
  starterHouseBlueprint,
  medievalWatchtowerBlueprint,
  stoneCastleBlueprint,
  gardenBridgeBlueprint,
  modernHouseBlueprint,
];

// Dynamically retrieves all built-in + custom admin blueprints
export function getAllBlueprints(includeCustom = true): BuildBlueprint[] {
  if (!includeCustom) return BUILTIN_BLUEPRINTS;
  const custom = getCustomBlueprints();
  // Filter out any custom that overrides built-in id
  const customFiltered = custom.filter((c) => !BUILTIN_BLUEPRINTS.some((b) => b.id === c.id || b.slug === c.slug));
  return [...BUILTIN_BLUEPRINTS, ...customFiltered];
}

// For backward compatibility
export const ALL_BLUEPRINTS: BuildBlueprint[] = BUILTIN_BLUEPRINTS;

export const BLUEPRINT_CATEGORIES = [
  'All',
  'Houses',
  'Castles',
  'Towers',
  'Bridges',
  'Modern Builds',
  'Farms',
  'Decorations',
] as const;

export type BlueprintCategory = (typeof BLUEPRINT_CATEGORIES)[number];

export function getBlueprintBySlug(slug: string): BuildBlueprint | undefined {
  const all = getAllBlueprints(true);
  return all.find((b) => b.slug === slug);
}

export function filterBlueprints(options: {
  search?: string;
  category?: BlueprintCategory;
  edition?: Edition | 'all';
  sortBy?: 'name' | 'size-asc' | 'size-desc' | 'difficulty';
  includeCustom?: boolean;
}): BuildBlueprint[] {
  const { search = '', category = 'All', edition = 'all', sortBy = 'name', includeCustom = true } = options;
  const q = search.trim().toLowerCase();
  const list = getAllBlueprints(includeCustom);

  return list.filter((bp) => {
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
