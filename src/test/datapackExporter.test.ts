import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { createJavaDatapackZip } from '../engine/exporters/datapackExporter';
import { generateBuildOutput } from '../engine/buildEngine';
import { starterHouseBlueprint } from '../data/blueprints/starterHouse';

describe('Java Datapack Exporter', () => {
  it('creates a valid Datapack ZIP with pack.mcmeta, build.mcfunction, and README.txt', async () => {
    const result = generateBuildOutput({
      blueprint: starterHouseBlueprint,
      targetEdition: 'java',
      targetOrigin: [100, 64, 200],
      rotation: 0,
    });

    const zipBlob = await createJavaDatapackZip(result);
    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(100);

    // Read the zip archive back using JSZip
    const arrayBuffer = await zipBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Verify pack.mcmeta exists and has valid json
    const mcmetaFile = zip.file('pack.mcmeta');
    expect(mcmetaFile).not.toBeNull();
    const mcmetaContent = await mcmetaFile!.async('string');
    const parsedMcmeta = JSON.parse(mcmetaContent);
    expect(parsedMcmeta.pack.pack_format).toBeDefined();
    expect(parsedMcmeta.pack.description).toContain('BLOCKFORGE');

    // Verify data/blockforge/function/build.mcfunction exists
    const functionFile = zip.file('data/blockforge/function/build.mcfunction');
    expect(functionFile).not.toBeNull();
    const functionContent = await functionFile!.async('string');
    expect(functionContent).toContain('fill');
    expect(functionContent).toContain('100 64 200');

    // Verify README.txt exists
    const readmeFile = zip.file('README.txt');
    expect(readmeFile).not.toBeNull();
    const readmeContent = await readmeFile!.async('string');
    expect(readmeContent).toContain('JAVA DATAPACK INSTALLATION GUIDE');
  });
});
