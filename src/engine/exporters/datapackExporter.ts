import JSZip from 'jszip';
import type { GenerationResult } from '../../types/blueprint';

export interface DatapackOptions {
  packFormat?: number; // 48 for 1.21+, 15 for 1.20.2-1.20.4
  namespace?: string;
}

/**
 * Creates a genuine, valid Java Datapack ZIP archive using JSZip.
 * Contains:
 * - pack.mcmeta (with valid metadata and description)
 * - data/<namespace>/function/build.mcfunction (all generated commands)
 * - README.txt (step-by-step installation instructions)
 */
export async function createJavaDatapackZip(
  result: GenerationResult,
  options: DatapackOptions = {}
): Promise<Blob> {
  const { packFormat = 48, namespace = 'blockforge' } = options;
  const zip = new JSZip();

  // 1. pack.mcmeta
  const mcmeta = {
    pack: {
      pack_format: packFormat,
      description: `BLOCKFORGE: ${result.blueprint.name} at (${result.targetOrigin.join(', ')})`,
    },
  };
  zip.file('pack.mcmeta', JSON.stringify(mcmeta, null, 2));

  // 2. data/<namespace>/function/build.mcfunction
  const functionCommands = [
    `# BLOCKFORGE Generated Datapack Function`,
    `# Structure: ${result.blueprint.name}`,
    `# Origin: ${result.targetOrigin.join(', ')} | Rotation: ${result.rotation}°`,
    `# Blocks: ${result.totalBlocks} | Commands: ${result.totalCommandsCount}`,
    '',
    // Strip leading slashes for function files in Java edition
    ...result.batches.flatMap((b) =>
      b.commands.map((c) => (c.command.startsWith('/') ? c.command.slice(1) : c.command))
    ),
    '',
    `tellraw @a [{"text":"[BLOCKFORGE] ","color":"green","bold":true},{"text":"Successfully constructed ${result.blueprint.name}!","color":"white"}]`,
  ].join('\n');

  zip.file(`data/${namespace}/function/build.mcfunction`, functionCommands);

  // 3. README.txt
  const [ox, oy, oz] = result.targetOrigin;
  const readme = [
    `=======================================================`,
    ` BLOCKFORGE — JAVA DATAPACK INSTALLATION GUIDE`,
    ` Structure: ${result.blueprint.name}`,
    ` Placed at: X=${ox}, Y=${oy}, Z=${oz}`,
    `=======================================================`,
    ``,
    `HOW TO USE IN MINECRAFT JAVA EDITION (1.20+ / 1.21+):`,
    ``,
    `1. LOCATE YOUR WORLD SAVE FOLDER:`,
    `   - Windows: %appdata%\\.minecraft\\saves\\<YourWorldName>\\datapacks\\`,
    `   - macOS:   ~/Library/Application Support/minecraft/saves/<YourWorldName>/datapacks/`,
    `   - Linux:   ~/.minecraft/saves/<YourWorldName>/datapacks/`,
    ``,
    `2. INSTALL THE DATAPACK:`,
    `   - Copy this ZIP file (or extract the folder) into the 'datapacks' folder.`,
    ``,
    `3. LOAD AND EXECUTE IN-GAME:`,
    `   - Ensure Cheats are enabled (or Open to LAN -> Allow Cheats: ON).`,
    `   - In Minecraft chat, run:`,
    `       /reload`,
    `   - Check that it is loaded:`,
    `       /datapack list`,
    `   - Execute the build command:`,
    `       /function ${namespace}:build`,
    ``,
    `4. RESULT:`,
    `   - The ${result.blueprint.name} will be instantly constructed at (${ox}, ${oy}, ${oz}).`,
    ``,
    `Note: Make sure your player is near or chunks are loaded at the build coordinates!`,
  ].join('\n');

  zip.file('README.txt', readme);

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
