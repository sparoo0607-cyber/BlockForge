import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlueprintBySlug } from '../data/blueprints';
import { VoxelPreview } from '../components/preview/VoxelPreview';
import {
  parseCoordinateInput,
  getRotatedDimensions,
  calculateBoundingBox,
  checkWorldHeightBounds,
} from '../engine/coordinateEngine';
import { generateBuildOutput } from '../engine/buildEngine';
import {
  downloadJavaDatapack,
  downloadMcFunctionFile,
  downloadRawCommandsTxt,
} from '../engine/exporters/fileDownloader';
import type {
  TargetEdition,
  RotationAngle,
  Position,
  GenerationResult,
} from '../types/blueprint';
import {
  ArrowLeft,
  Box,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Info,
  Terminal,
  FileArchive,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Compass,
} from 'lucide-react';

export const BuildGeneratorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const blueprint = slug ? getBlueprintBySlug(slug) : undefined;

  // Form States
  const [edition, setEdition] = useState<TargetEdition>('java');
  const [coordX, setCoordX] = useState<string>('0');
  const [coordY, setCoordY] = useState<string>('64');
  const [coordZ, setCoordZ] = useState<string>('0');
  const [rotation, setRotation] = useState<RotationAngle>(0);
  const [outputFormat, setOutputFormat] = useState<'both' | 'commands' | 'files'>('both');

  // Generation & Output State
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'commands' | 'downloads' | 'instructions'>('commands');
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copy feedback states
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedLineIndex, setCopiedLineIndex] = useState<number | null>(null);

  // Download loading states
  const [downloadingDatapack, setDownloadingDatapack] = useState(false);

  // Live bounding box calculations
  const liveBoundingBox = useMemo(() => {
    if (!blueprint) return null;
    try {
      const x = parseCoordinateInput(coordX, 'X');
      const y = parseCoordinateInput(coordY, 'Y');
      const z = parseCoordinateInput(coordZ, 'Z');
      const rotatedDims = getRotatedDimensions(blueprint.dimensions, rotation);
      const bb = calculateBoundingBox([x, y, z], rotatedDims);
      const heightWarns = checkWorldHeightBounds(bb);
      return { bb, rotatedDims, heightWarns, valid: true };
    } catch {
      return { valid: false };
    }
  }, [blueprint, coordX, coordY, coordZ, rotation]);

  if (!blueprint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold text-[#F3F5EF]">Structure Not Found</h2>
        <Link
          to="/builds"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#79D45B] text-[#0D0F0D] font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const x = parseCoordinateInput(coordX, 'X');
      const y = parseCoordinateInput(coordY, 'Y');
      const z = parseCoordinateInput(coordZ, 'Z');

      const targetOrigin: Position = [x, y, z];
      const result = generateBuildOutput({
        blueprint,
        targetEdition: edition,
        targetOrigin,
        rotation,
        batchSize: 30,
      });

      setGenerationResult(result);
      setCurrentBatchIndex(0);

      // Auto scroll to results
      setTimeout(() => {
        const el = document.getElementById('generation-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during build generation');
    }
  };

  const copyToClipboard = async (text: string, type: 'batch' | 'all' | 'line', lineIdx?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'batch') {
        setCopiedBatch(true);
        setTimeout(() => setCopiedBatch(false), 2000);
      } else if (type === 'all') {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } else if (type === 'line' && lineIdx !== undefined) {
        setCopiedLineIndex(lineIdx);
        setTimeout(() => setCopiedLineIndex(null), 1500);
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownloadDatapack = async () => {
    if (!generationResult) return;
    setDownloadingDatapack(true);
    try {
      await downloadJavaDatapack(generationResult);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingDatapack(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/builds/${blueprint.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A0A89D] hover:text-[#79D45B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {blueprint.name} Details
        </Link>
        <span className="text-xs font-mono text-[#79D45B]">Build Generator</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Build Details & Interactive Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-5 space-y-4 shadow-lg sticky top-24">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A0A89D] mb-1">
                <span>{blueprint.category}</span>
                <span className="font-mono">{blueprint.difficulty}</span>
              </div>
              <h2 className="text-xl font-bold text-[#F3F5EF]">{blueprint.name}</h2>
              <p className="text-xs text-[#A0A89D] mt-1 line-clamp-2">
                {blueprint.description}
              </p>
            </div>

            {/* Live 3D Preview (updates with rotation!) */}
            <div className="rounded-xl overflow-hidden border border-[#2A3229]">
              <VoxelPreview
                blueprint={blueprint}
                rotation={rotation}
                height={280}
              />
            </div>

            {/* Build Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#1D231D] border border-[#2A3229] text-center">
                <span className="text-[#A0A89D] block text-[11px]">Dimensions</span>
                <span className="text-[#F3F5EF] font-bold">
                  {blueprint.dimensions.width}W × {blueprint.dimensions.height}H × {blueprint.dimensions.depth}D
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1D231D] border border-[#2A3229] text-center">
                <span className="text-[#A0A89D] block text-[11px]">Block Count</span>
                <span className="text-[#79D45B] font-bold">
                  {blueprint.blocks.length} blocks
                </span>
              </div>
            </div>

            {/* Live World Bounding Box Indicator */}
            {liveBoundingBox?.valid && liveBoundingBox.bb && (
              <div className="p-3 rounded-lg bg-[#1D231D] border border-[#2A3229] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[#A0A89D]">
                  <span>World Footprint:</span>
                  <span className="text-[#79D45B] font-bold">
                    {liveBoundingBox.rotatedDims.width}×{liveBoundingBox.rotatedDims.height}×{liveBoundingBox.rotatedDims.depth}
                  </span>
                </div>
                <div className="text-[11px] text-[#A0A89D] flex items-center justify-between">
                  <span>From:</span>
                  <span className="text-[#F3F5EF]">({liveBoundingBox.bb.min.join(', ')})</span>
                </div>
                <div className="text-[11px] text-[#A0A89D] flex items-center justify-between">
                  <span>To:</span>
                  <span className="text-[#F3F5EF]">({liveBoundingBox.bb.max.join(', ')})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: 5-Step Generator Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerate} className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
            {/* Step 1: Edition Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-xs">
                  1
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F5EF]">
                  Choose Minecraft Edition
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Java */}
                <button
                  type="button"
                  onClick={() => setEdition('java')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    edition === 'java'
                      ? 'bg-[#79D45B]/10 border-[#79D45B] text-[#F3F5EF] shadow-xs'
                      : 'bg-[#1D231D] border-[#2A3229] text-[#A0A89D] hover:border-[#3E4B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Monitor className={`w-5 h-5 ${edition === 'java' ? 'text-[#79D45B]' : 'text-[#A0A89D]'}`} />
                    {edition === 'java' && <Check className="w-4 h-4 text-[#79D45B]" />}
                  </div>
                  <div className="font-bold text-sm text-[#F3F5EF]">Java Edition</div>
                  <div className="text-[11px] text-[#A0A89D] mt-0.5 font-mono">1.20 - 1.21+</div>
                </button>

                {/* Bedrock */}
                <button
                  type="button"
                  onClick={() => setEdition('bedrock')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    edition === 'bedrock'
                      ? 'bg-[#79D45B]/10 border-[#79D45B] text-[#F3F5EF] shadow-xs'
                      : 'bg-[#1D231D] border-[#2A3229] text-[#A0A89D] hover:border-[#3E4B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Box className={`w-5 h-5 ${edition === 'bedrock' ? 'text-[#79D45B]' : 'text-[#A0A89D]'}`} />
                    {edition === 'bedrock' && <Check className="w-4 h-4 text-[#79D45B]" />}
                  </div>
                  <div className="font-bold text-sm text-[#F3F5EF]">Bedrock</div>
                  <div className="text-[11px] text-[#A0A89D] mt-0.5 font-mono">PC & Consoles</div>
                </button>

                {/* Mobile */}
                <button
                  type="button"
                  onClick={() => setEdition('mobile')}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    edition === 'mobile'
                      ? 'bg-[#79D45B]/10 border-[#79D45B] text-[#F3F5EF] shadow-xs'
                      : 'bg-[#1D231D] border-[#2A3229] text-[#A0A89D] hover:border-[#3E4B3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Smartphone className={`w-5 h-5 ${edition === 'mobile' ? 'text-[#79D45B]' : 'text-[#A0A89D]'}`} />
                    {edition === 'mobile' && <Check className="w-4 h-4 text-[#79D45B]" />}
                  </div>
                  <div className="font-bold text-sm text-[#F3F5EF]">Mobile</div>
                  <div className="text-[11px] text-[#79D45B] mt-0.5 font-mono">Bedrock iOS/Android</div>
                </button>
              </div>
            </div>

            {/* Step 2: World Coordinates */}
            <div className="space-y-3 pt-2 border-t border-[#1D231D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-xs">
                    2
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F5EF]">
                    World Coordinates (Target Origin)
                  </h3>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-[#A0A89D] hidden sm:inline">Presets:</span>
                  <button
                    type="button"
                    onClick={() => { setCoordX('0'); setCoordY('64'); setCoordZ('0'); }}
                    className="px-2 py-0.5 rounded bg-[#1D231D] hover:bg-[#242D24] border border-[#2A3229] text-[#A0A89D] hover:text-[#F3F5EF]"
                  >
                    Spawn (0,64,0)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCoordX('100'); setCoordY('64'); setCoordZ('200'); }}
                    className="px-2 py-0.5 rounded bg-[#1D231D] hover:bg-[#242D24] border border-[#2A3229] text-[#A0A89D] hover:text-[#F3F5EF]"
                  >
                    (100,64,200)
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#A0A89D]">
                Enter the exact world coordinates where the lower corner <span className="font-mono text-[#F3F5EF]">(0, 0, 0)</span> of this build should be placed. Supports positive, negative, and zero coordinates.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {/* X */}
                <div className="space-y-1">
                  <label htmlFor="coord-x" className="block text-xs font-mono font-semibold text-[#A0A89D]">
                    X Coordinate
                  </label>
                  <input
                    id="coord-x"
                    type="text"
                    value={coordX}
                    onChange={(e) => setCoordX(e.target.value)}
                    required
                    placeholder="e.g. 100"
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2.5 font-mono text-sm text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                {/* Y */}
                <div className="space-y-1">
                  <label htmlFor="coord-y" className="block text-xs font-mono font-semibold text-[#A0A89D]">
                    Y (Height)
                  </label>
                  <input
                    id="coord-y"
                    type="text"
                    value={coordY}
                    onChange={(e) => setCoordY(e.target.value)}
                    required
                    placeholder="e.g. 64"
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2.5 font-mono text-sm text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                {/* Z */}
                <div className="space-y-1">
                  <label htmlFor="coord-z" className="block text-xs font-mono font-semibold text-[#A0A89D]">
                    Z Coordinate
                  </label>
                  <input
                    id="coord-z"
                    type="text"
                    value={coordZ}
                    onChange={(e) => setCoordZ(e.target.value)}
                    required
                    placeholder="e.g. 200"
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2.5 font-mono text-sm text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>
              </div>

              {/* Height Warnings */}
              {liveBoundingBox?.valid && 'heightWarns' in liveBoundingBox && (liveBoundingBox.heightWarns?.length ?? 0) > 0 && (
                <div className="space-y-1.5 pt-1">
                  {liveBoundingBox.heightWarns!.map((w, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        w.severity === 'error'
                          ? 'bg-red-950/30 border-red-800/50 text-red-300'
                          : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{w.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Orientation / Rotation */}
            <div className="space-y-3 pt-2 border-t border-[#1D231D]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-xs">
                  3
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F5EF]">
                  Rotation Angle
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                {[
                  { angle: 0, label: '0° (Default)' },
                  { angle: 90, label: '90° Clockwise' },
                  { angle: 180, label: '180° Flip' },
                  { angle: 270, label: '270° Clockwise' },
                ].map((item) => {
                  const isSel = rotation === item.angle;
                  return (
                    <button
                      key={item.angle}
                      type="button"
                      onClick={() => setRotation(item.angle as RotationAngle)}
                      className={`py-3 px-3 rounded-xl border text-center transition-all ${
                        isSel
                          ? 'bg-[#79D45B]/15 border-[#79D45B] text-[#79D45B] font-bold'
                          : 'bg-[#1D231D] border-[#2A3229] text-[#A0A89D] hover:text-[#F3F5EF] hover:border-[#3E4B3D]'
                      }`}
                    >
                      <RotateCw className={`w-4 h-4 mx-auto mb-1 ${isSel ? 'text-[#79D45B]' : 'text-[#A0A89D]'}`} />
                      <div>{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Output Preferences */}
            <div className="space-y-3 pt-2 border-t border-[#1D231D]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-xs">
                  4
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F5EF]">
                  Output Format
                </h3>
              </div>

              <div className="flex items-center rounded-xl bg-[#1D231D] border border-[#2A3229] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setOutputFormat('both')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    outputFormat === 'both'
                      ? 'bg-[#242D24] text-[#79D45B]'
                      : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                  }`}
                >
                  Both Commands & Files
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('commands')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    outputFormat === 'commands'
                      ? 'bg-[#242D24] text-[#79D45B]'
                      : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                  }`}
                >
                  Commands Only
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('files')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    outputFormat === 'files'
                      ? 'bg-[#242D24] text-[#79D45B]'
                      : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                  }`}
                >
                  Downloadable Files Only
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 5: Generate CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-extrabold text-base transition-all shadow-[0_4px_24px_rgba(121,212,91,0.3)] hover:shadow-[0_6px_32px_rgba(121,212,91,0.45)] active:scale-[0.99]"
              >
                <Sparkles className="w-5 h-5" />
                Generate Build
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Generated Output Interface (Section 14) */}
      {generationResult && (
        <section id="generation-results" className="pt-6 space-y-6 scroll-mt-24">
          <div className="bg-[#151915] border border-[#2A3229] rounded-2xl overflow-hidden shadow-2xl">
            {/* Success Header Banner */}
            <div className="bg-gradient-to-r from-[#182518] to-[#121612] border-b border-[#2A3229] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#79D45B]">
                    <Check className="w-4 h-4" /> Build Generated Successfully
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#F3F5EF]">
                    {generationResult.blueprint.name}
                  </h3>
                  <p className="text-xs text-[#A0A89D]">
                    Constructing at <span className="font-mono text-[#F3F5EF]">X={generationResult.targetOrigin[0]}, Y={generationResult.targetOrigin[1]}, Z={generationResult.targetOrigin[2]}</span> ({generationResult.targetEdition.toUpperCase()})
                  </p>
                </div>

                {/* Quick actions in banner */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generationResult.allCommandsText, 'all')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#242D24] hover:bg-[#2A3229] border border-[#2A3229] text-xs font-semibold text-[#F3F5EF] transition-colors"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-[#79D45B]" /> : <Copy className="w-4 h-4 text-[#79D45B]" />}
                    {copiedAll ? 'Copied All!' : 'Copy All Commands'}
                  </button>
                  {generationResult.effectiveEdition === 'java' && (
                    <button
                      type="button"
                      onClick={handleDownloadDatapack}
                      disabled={downloadingDatapack}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] text-xs font-bold transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingDatapack ? 'Packaging...' : 'Download Datapack (.zip)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#2A3229]/60 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#121612] border border-[#2A3229]/60">
                  <span className="text-[#A0A89D] text-[11px] block">Placed Blocks</span>
                  <span className="text-[#F3F5EF] font-bold text-sm">{generationResult.totalBlocks}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#121612] border border-[#2A3229]/60">
                  <span className="text-[#A0A89D] text-[11px] block">Generated Commands</span>
                  <span className="text-[#79D45B] font-bold text-sm">
                    {generationResult.totalCommandsCount}{' '}
                    <span className="text-[10px] text-[#A0A89D] font-normal">
                      ({generationResult.fillCommandsCount} /fill, {generationResult.setblockCommandsCount} /setblock)
                    </span>
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#121612] border border-[#2A3229]/60">
                  <span className="text-[#A0A89D] text-[11px] block">Batches</span>
                  <span className="text-[#F3F5EF] font-bold text-sm">{generationResult.batches.length}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#121612] border border-[#2A3229]/60">
                  <span className="text-[#A0A89D] text-[11px] block">Final Bounds</span>
                  <span className="text-[#F3F5EF] text-[11px] block truncate">
                    ({generationResult.boundingBox.min.join(',')}) → ({generationResult.boundingBox.max.join(',')})
                  </span>
                </div>
              </div>

              {/* Warnings (if any) */}
              {generationResult.warnings.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {generationResult.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        w.severity === 'error'
                          ? 'bg-red-950/30 border-red-800 text-red-300'
                          : w.severity === 'warning'
                          ? 'bg-amber-950/20 border-amber-800 text-amber-300'
                          : 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                      }`}
                    >
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{w.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#2A3229] px-6 bg-[#111511]">
              <button
                type="button"
                onClick={() => setActiveTab('commands')}
                className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'commands'
                    ? 'border-[#79D45B] text-[#79D45B]'
                    : 'border-transparent text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                <Terminal className="w-4 h-4" /> Commands ({generationResult.totalCommandsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('downloads')}
                className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'downloads'
                    ? 'border-[#79D45B] text-[#79D45B]'
                    : 'border-transparent text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                <Download className="w-4 h-4" /> Downloadable Files
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instructions')}
                className={`py-3.5 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'instructions'
                    ? 'border-[#79D45B] text-[#79D45B]'
                    : 'border-transparent text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                <Compass className="w-4 h-4" /> In-Game Instructions
              </button>
            </div>

            {/* Tab 1: Commands Viewer */}
            {activeTab === 'commands' && (
              <div className="p-6 space-y-4">
                {/* Batch Navigation Bar */}
                {generationResult.batches.length > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#1D231D] border border-[#2A3229] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#F3F5EF]">
                        Batch {currentBatchIndex + 1} of {generationResult.batches.length}
                      </span>
                      <span className="text-[#A0A89D]">
                        ({generationResult.batches[currentBatchIndex].commands.length} commands, ~{generationResult.batches[currentBatchIndex].totalBlocks} blocks)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentBatchIndex === 0}
                        onClick={() => setCurrentBatchIndex((prev) => Math.max(0, prev - 1))}
                        className="px-2.5 py-1 rounded bg-[#242D24] disabled:opacity-40 text-[#F3F5EF] hover:bg-[#2A3229] border border-[#2A3229] flex items-center gap-1 font-medium"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev Batch
                      </button>
                      <button
                        type="button"
                        disabled={currentBatchIndex === generationResult.batches.length - 1}
                        onClick={() => setCurrentBatchIndex((prev) => Math.min(generationResult.batches.length - 1, prev + 1))}
                        className="px-2.5 py-1 rounded bg-[#242D24] disabled:opacity-40 text-[#F3F5EF] hover:bg-[#2A3229] border border-[#2A3229] flex items-center gap-1 font-medium"
                      >
                        Next Batch <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generationResult.batches[currentBatchIndex].rawText, 'batch')}
                        className="px-3 py-1 rounded bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-bold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedBatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBatch ? 'Copied Batch!' : 'Copy Batch'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Monospace Code Display */}
                <div className="rounded-xl border border-[#2A3229] bg-[#0A0D0A] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A3229] bg-[#121612] text-xs text-[#A0A89D]">
                    <span>Minecraft Command Stream</span>
                    <span>Click any line to copy individual command</span>
                  </div>
                  <div className="p-4 overflow-x-auto max-h-[460px] font-mono text-xs leading-relaxed space-y-1">
                    {generationResult.batches[currentBatchIndex]?.commands.map((cmd, idx) => (
                      <div
                        key={idx}
                        onClick={() => copyToClipboard(cmd.command, 'line', idx)}
                        className={`group px-2 py-1 rounded flex items-center justify-between cursor-pointer transition-colors ${
                          copiedLineIndex === idx
                            ? 'bg-[#79D45B]/20 text-[#79D45B]'
                            : 'hover:bg-[#1D231D] text-[#E0E4DC]'
                        }`}
                        title="Click to copy this command"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-[#A0A89D]/50 text-[11px] w-6 shrink-0 select-none">
                            {idx + 1}
                          </span>
                          <span className="truncate">
                            <span className="text-[#79D45B]">{cmd.command.split(' ')[0]}</span>{' '}
                            {cmd.command.split(' ').slice(1).join(' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A0A89D] group-hover:text-[#F3F5EF] shrink-0 ml-2">
                          {copiedLineIndex === idx ? 'Copied!' : 'Copy'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Downloadable Files */}
            {activeTab === 'downloads' && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Java Datapack ZIP */}
                  <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                    generationResult.effectiveEdition === 'java'
                      ? 'bg-[#1D231D] border-[#2A3229]'
                      : 'bg-[#151915]/50 border-[#2A3229]/40 opacity-70'
                  }`}>
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-[#242D24] border border-[#2A3229] flex items-center justify-center text-[#79D45B]">
                        <FileArchive className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-[#F3F5EF]">Java Datapack (.zip)</h4>
                      <p className="text-xs text-[#A0A89D] leading-relaxed">
                        Complete plug-and-play Minecraft Java datapack containing <code className="text-[#79D45B]">pack.mcmeta</code> and <code className="text-[#79D45B]">build.mcfunction</code>.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={generationResult.effectiveEdition !== 'java' || downloadingDatapack}
                      onClick={handleDownloadDatapack}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#79D45B] hover:bg-[#8CE26E] disabled:opacity-50 text-[#0D0F0D] font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingDatapack ? 'Generating ZIP...' : 'Download Datapack'}
                    </button>
                  </div>

                  {/* Standalone .mcfunction */}
                  <div className="p-5 rounded-xl bg-[#1D231D] border border-[#2A3229] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-[#242D24] border border-[#2A3229] flex items-center justify-center text-[#79D45B]">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-[#F3F5EF]">Function File (.mcfunction)</h4>
                      <p className="text-xs text-[#A0A89D] leading-relaxed">
                        Pure function file compatible with both Java and Bedrock behavior packs, or server functions directory.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadMcFunctionFile(generationResult)}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#242D24] hover:bg-[#2A3229] border border-[#2A3229] text-[#F3F5EF] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#79D45B]" />
                      Download .mcfunction
                    </button>
                  </div>

                  {/* Plain Text Commands (.txt) */}
                  <div className="p-5 rounded-xl bg-[#1D231D] border border-[#2A3229] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-[#242D24] border border-[#2A3229] flex items-center justify-center text-[#79D45B]">
                        <Box className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-[#F3F5EF]">Raw Command List (.txt)</h4>
                      <p className="text-xs text-[#A0A89D] leading-relaxed">
                        Plain-text file containing all generated commands with build metadata comments for easy copying.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadRawCommandsTxt(generationResult)}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#242D24] hover:bg-[#2A3229] border border-[#2A3229] text-[#F3F5EF] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#79D45B]" />
                      Download .txt
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: In-Game Instructions */}
            {activeTab === 'instructions' && (
              <div className="p-6 space-y-6 text-xs text-[#A0A89D] leading-relaxed">
                {generationResult.effectiveEdition === 'java' ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#F3F5EF] flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#79D45B]" /> Java Edition Instructions (Datapack & Commands)
                    </h4>
                    <div className="bg-[#1D231D] border border-[#2A3229] rounded-xl p-4 space-y-3">
                      <div className="font-semibold text-[#F3F5EF]">Option A: Using the Datapack (Fastest & 1-Click)</div>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Download the <strong className="text-[#F3F5EF]">Java Datapack (.zip)</strong> above.</li>
                        <li>Open your Minecraft world save directory:
                          <div className="mt-1 p-2 rounded bg-[#0D0F0D] font-mono text-[11px] text-[#79D45B]">
                            %appdata%\.minecraft\saves\&lt;YourWorld&gt;\datapacks\
                          </div>
                        </li>
                        <li>Copy the downloaded ZIP into that <code className="text-[#79D45B]">datapacks</code> folder.</li>
                        <li>In Minecraft, ensure cheats are enabled, then run:
                          <div className="mt-1 p-2 rounded bg-[#0D0F0D] font-mono text-[11px] text-[#F3F5EF]">
                            /reload
                          </div>
                        </li>
                        <li>Construct the build instantly at your target coordinates:
                          <div className="mt-1 p-2 rounded bg-[#0D0F0D] font-mono text-[11px] text-[#79D45B]">
                            /function blockforge:build
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-[#1D231D] border border-[#2A3229] rounded-xl p-4 space-y-3">
                      <div className="font-semibold text-[#F3F5EF]">Option B: Running Commands Directly</div>
                      <p>
                        Switch to the <strong className="text-[#F3F5EF]">Commands</strong> tab, copy each batch, and paste the commands into your game chat or an impulse command block powered by redstone.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#F3F5EF] flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#79D45B]" /> Bedrock & Mobile Instructions
                    </h4>
                    <div className="bg-[#1D231D] border border-[#2A3229] rounded-xl p-4 space-y-3">
                      <div className="font-semibold text-[#F3F5EF]">Executing on Bedrock / Mobile (iOS & Android):</div>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Ensure <strong className="text-[#F3F5EF]">Allow Cheats</strong> is turned ON in your World Settings.</li>
                        <li>Copy individual commands or batches from the Commands tab.</li>
                        <li>Open the in-game chat bar (or place a <code className="text-[#79D45B]">Command Block</code>: <code className="text-[#79D45B]">/give @s command_block</code>).</li>
                        <li>Paste and execute each command. The cuboid optimization minimizes the total number of commands so you can build structures in just a few pastes!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
