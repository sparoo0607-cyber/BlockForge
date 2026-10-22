import type { GenerationResult } from '../../types/blueprint';
import { createJavaDatapackZip } from './datapackExporter';

/**
 * Triggers a browser download for a Blob with the specified filename
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up object URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Downloads a plain text or mcfunction file
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  triggerFileDownload(blob, filename);
}

/**
 * Downloads the full Java Datapack ZIP
 */
export async function downloadJavaDatapack(result: GenerationResult): Promise<void> {
  const [ox, oy, oz] = result.targetOrigin;
  const filename = `blockforge-${result.blueprint.slug}-java-datapack-x${ox}_y${oy}_z${oz}.zip`;
  const blob = await createJavaDatapackZip(result);
  triggerFileDownload(blob, filename);
}

/**
 * Downloads a standalone .mcfunction file (Java or Bedrock)
 */
export function downloadMcFunctionFile(result: GenerationResult): void {
  const [ox, oy, oz] = result.targetOrigin;
  const isJava = result.effectiveEdition === 'java';
  const filename = `build-${result.blueprint.slug}-${result.effectiveEdition}-x${ox}_y${oy}_z${oz}.mcfunction`;

  // In .mcfunction files, commands do not need leading slashes
  const lines = [
    `# BLOCKFORGE — ${result.blueprint.name}`,
    `# Target Edition: ${result.effectiveEdition.toUpperCase()}`,
    `# Coordinates: X=${ox}, Y=${oy}, Z=${oz} | Rotation: ${result.rotation}°`,
    `# Total commands: ${result.totalCommandsCount}`,
    '',
    ...result.batches.flatMap((b) =>
      b.commands.map((c) => {
        const raw = c.command.trim();
        return raw.startsWith('/') ? raw.slice(1) : raw;
      })
    ),
  ];

  if (isJava) {
    lines.push(`tellraw @a {"text":"[BLOCKFORGE] Built ${result.blueprint.name}!","color":"green"}`);
  }

  downloadTextFile(lines.join('\n'), filename, 'text/plain;charset=utf-8');
}

/**
 * Downloads a raw plain-text command list (.txt)
 */
export function downloadRawCommandsTxt(result: GenerationResult): void {
  const [ox, oy, oz] = result.targetOrigin;
  const filename = `commands-${result.blueprint.slug}-${result.targetEdition}-x${ox}_y${oy}_z${oz}.txt`;
  downloadTextFile(result.allCommandsText, filename, 'text/plain;charset=utf-8');
}
