export type Position = [x: number, y: number, z: number];

export type Edition = 'java' | 'bedrock';
export type TargetEdition = 'java' | 'bedrock' | 'mobile';

export type RotationAngle = 0 | 90 | 180 | 270;
export type Axis = 'x' | 'y' | 'z';

export type BlockStateValue = string | number | boolean;
export type BlockStates = Record<string, BlockStateValue>;

export interface BlockPlacement {
  pos: Position;
  block: string;
  states?: BlockStates;
}

export interface BuildDimensions {
  width: number;  // X span
  height: number; // Y span
  depth: number;  // Z span
}

export interface BoundingBox {
  min: Position;
  max: Position;
}

export interface BuildBlueprint {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'Houses' | 'Castles' | 'Towers' | 'Bridges' | 'Modern Builds' | 'Farms' | 'Decorations';
  dimensions: BuildDimensions;
  origin: Position; // Default local coordinate origin, typically [0, 0, 0]
  blocks: BlockPlacement[];
  supportedEditions: Edition[];
  estimatedBlockCount: number;
  difficulty: 'Starter' | 'Intermediate' | 'Advanced';
  tags: string[];
  prerequisites?: string;
  limitations?: string;
  accentColor?: string;
}

export interface TransformedBlock {
  worldPos: Position;
  localPos: Position;
  block: string;
  states?: BlockStates;
}

export interface CuboidRegion {
  from: Position;
  to: Position;
  block: string;
  states?: BlockStates;
  volume: number;
}

export interface GeneratedCommand {
  type: 'fill' | 'setblock' | 'comment';
  command: string;
  blockCount: number;
  description?: string;
}

export interface CommandBatch {
  batchNumber: number;
  totalBatches: number;
  commands: GeneratedCommand[];
  rawText: string;
  totalBlocks: number;
}

export interface GenerationWarning {
  type: 'height_warning' | 'bedrock_state_warning' | 'large_volume_warning' | 'compatibility';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface GenerationResult {
  blueprint: BuildBlueprint;
  targetEdition: TargetEdition;
  effectiveEdition: Edition; // 'mobile' maps to 'bedrock'
  targetOrigin: Position;
  rotation: RotationAngle;
  boundingBox: BoundingBox;
  dimensions: BuildDimensions;
  totalBlocks: number;
  fillCommandsCount: number;
  setblockCommandsCount: number;
  totalCommandsCount: number;
  batches: CommandBatch[];
  allCommandsText: string;
  warnings: GenerationWarning[];
  uniqueMaterials: { block: string; count: number }[];
}

export interface ExportOption {
  id: 'datapack' | 'mcfunction' | 'txt' | 'bedrock_guide';
  name: string;
  description: string;
  extension: string;
  supportedEditions: Edition[];
  available: boolean;
}
