import type {
  BuildBlueprint,
  TargetEdition,
  Edition,
  Position,
  RotationAngle,
  GenerationResult,
  GenerationWarning,
  GeneratedCommand,
} from '../types/blueprint';
import { validateBlueprint } from './blueprintValidator';
import {
  transformBlueprintBlocks,
  getRotatedDimensions,
  calculateBoundingBox,
  checkWorldHeightBounds,
} from './coordinateEngine';
import { optimizeBlockPlacements } from './cuboidOptimizer';
import { batchCommands } from './commandBatcher';
import { JavaCommandAdapter } from './adapters/javaAdapter';
import { BedrockCommandAdapter } from './adapters/bedrockAdapter';

export interface GenerationInput {
  blueprint: BuildBlueprint;
  targetEdition: TargetEdition;
  targetOrigin: Position;
  rotation: RotationAngle;
  batchSize?: number;
}

export function generateBuildOutput(input: GenerationInput): GenerationResult {
  const {
    blueprint,
    targetEdition,
    targetOrigin,
    rotation,
    batchSize = 30,
  } = input;

  // 1. Validate Blueprint
  const validation = validateBlueprint(blueprint);
  if (!validation.valid) {
    throw new Error(`Invalid blueprint "${blueprint?.name ?? 'unknown'}": ${validation.errors.join('; ')}`);
  }

  // 2. Resolve effective edition (mobile uses bedrock commands)
  const effectiveEdition: Edition = targetEdition === 'mobile' ? 'bedrock' : targetEdition;

  // 3. Check edition compatibility
  const warnings: GenerationWarning[] = [];
  if (!blueprint.supportedEditions.includes(effectiveEdition)) {
    warnings.push({
      type: 'compatibility',
      severity: 'warning',
      message: `Blueprint "${blueprint.name}" is primarily tagged for [${blueprint.supportedEditions.join(', ')}]. Output will be generated using ${effectiveEdition} command syntax.`,
    });
  }

  if (targetEdition === 'mobile') {
    warnings.push({
      type: 'compatibility',
      severity: 'info',
      message: 'Mobile builds use Bedrock Edition commands. You can copy command batches into chat or use a function pack on iOS/Android.',
    });
  }

  // 4. Transform coordinates and rotate
  const rotatedDimensions = getRotatedDimensions(blueprint.dimensions, rotation);
  const boundingBox = calculateBoundingBox(targetOrigin, rotatedDimensions);

  // Height bounds check
  const heightWarnings = checkWorldHeightBounds(boundingBox);
  warnings.push(...heightWarnings);

  const transformedBlocks = transformBlueprintBlocks(
    blueprint.blocks,
    blueprint.dimensions,
    targetOrigin,
    rotation
  );

  // 5. Optimize with Cuboids
  const adapter = effectiveEdition === 'java' ? new JavaCommandAdapter() : new BedrockCommandAdapter();
  const optimized = optimizeBlockPlacements(transformedBlocks, adapter.maxFillVolume);

  // 6. Generate Commands
  const generatedCommands: GeneratedCommand[] = [];

  // Add cuboid fill commands first (foundations, walls, ceilings)
  for (const cuboid of optimized.cuboids) {
    const cmd = adapter.generateFill(cuboid.from, cuboid.to, cuboid.block, cuboid.states, cuboid.volume);
    generatedCommands.push(cmd);
  }

  // Add individual setblock commands
  for (const single of optimized.singleBlocks) {
    const cmd = adapter.generateSetblock(single.worldPos, single.block, single.states);
    generatedCommands.push(cmd);
  }

  // 7. Calculate materials tally
  const materialMap = new Map<string, number>();
  for (const b of transformedBlocks) {
    const count = materialMap.get(b.block) || 0;
    materialMap.set(b.block, count + 1);
  }
  const uniqueMaterials = Array.from(materialMap.entries())
    .map(([block, count]) => ({ block, count }))
    .sort((a, b) => b.count - a.count);

  // 8. Batch commands
  const batches = batchCommands(generatedCommands, batchSize);

  // Header banner for raw text
  const [ox, oy, oz] = targetOrigin;
  const header = [
    `# BLOCKFORGE — Minecraft Build Generator`,
    `# Structure: ${blueprint.name} (${blueprint.slug})`,
    `# Target Edition: ${targetEdition.toUpperCase()} (Using ${effectiveEdition.toUpperCase()} syntax)`,
    `# Origin: X=${ox}, Y=${oy}, Z=${oz} | Rotation: ${rotation}°`,
    `# Dimensions: ${rotatedDimensions.width}W x ${rotatedDimensions.height}H x ${rotatedDimensions.depth}D`,
    `# Bounding Box: (${boundingBox.min.join(', ')}) to (${boundingBox.max.join(', ')})`,
    `# Total Blocks Placed: ${transformedBlocks.length}`,
    `# Generated Commands: ${generatedCommands.length} (${optimized.cuboids.length} /fill, ${optimized.singleBlocks.length} /setblock)`,
    `# ----------------------------------------------------------------------`,
    '',
  ].join('\n');

  const allCommandsText = header + generatedCommands.map((c) => c.command).join('\n');

  return {
    blueprint,
    targetEdition,
    effectiveEdition,
    targetOrigin,
    rotation,
    boundingBox,
    dimensions: rotatedDimensions,
    totalBlocks: transformedBlocks.length,
    fillCommandsCount: optimized.cuboids.length,
    setblockCommandsCount: optimized.singleBlocks.length,
    totalCommandsCount: generatedCommands.length,
    batches,
    allCommandsText,
    warnings,
    uniqueMaterials,
  };
}
