import type { GeneratedCommand, CommandBatch } from '../types/blueprint';

export function batchCommands(
  commands: GeneratedCommand[],
  batchSize: number = 30
): CommandBatch[] {
  if (commands.length === 0) {
    return [];
  }

  const batches: CommandBatch[] = [];
  const totalBatches = Math.ceil(commands.length / batchSize);

  for (let i = 0; i < commands.length; i += batchSize) {
    const chunk = commands.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const rawText = chunk.map((c) => c.command).join('\n');
    const totalBlocks = chunk.reduce((acc, c) => acc + c.blockCount, 0);

    batches.push({
      batchNumber,
      totalBatches,
      commands: chunk,
      rawText,
      totalBlocks,
    });
  }

  return batches;
}
