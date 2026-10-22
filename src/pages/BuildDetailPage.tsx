import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlueprintBySlug } from '../data/blueprints';
import { VoxelPreview } from '../components/preview/VoxelPreview';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Layers,
  Info,
  Sparkles,
  Check,
} from 'lucide-react';

export const BuildDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const blueprint = slug ? getBlueprintBySlug(slug) : undefined;

  // Calculate material palette
  const materials = useMemo(() => {
    if (!blueprint) return [];
    const counts = new Map<string, number>();
    for (const b of blueprint.blocks) {
      const current = counts.get(b.block) || 0;
      counts.set(b.block, current + 1);
    }
    return Array.from(counts.entries())
      .map(([block, count]) => ({
        block: block.replace('minecraft:', ''),
        fullName: block,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [blueprint]);

  if (!blueprint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#151915] border border-[#2A3229] flex items-center justify-center mx-auto text-[#A0A89D]">
          <Box className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#F3F5EF]">Structure Not Found</h2>
        <p className="text-sm text-[#A0A89D] max-w-md mx-auto">
          The requested structure blueprint "{slug}" could not be found in the catalogue.
        </p>
        <Link
          to="/builds"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#79D45B] text-[#0D0F0D] font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const { width, height, depth } = blueprint.dimensions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/builds"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A0A89D] hover:text-[#79D45B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#A0A89D]">
          <span>{blueprint.category}</span>
          <span>/</span>
          <span className="text-[#F3F5EF]">{blueprint.slug}</span>
        </div>
      </div>

      {/* Main Grid: Left 3D Preview & Right Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Voxel Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#2A3229] text-xs">
              <span className="font-semibold text-[#F3F5EF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#79D45B]" />
                Interactive 3D Blueprint Inspector
              </span>
              <span className="text-[#A0A89D]">Drag to rotate • Scroll to zoom</span>
            </div>
            <VoxelPreview blueprint={blueprint} height={440} />
            <div className="mt-3 flex items-center justify-between text-xs text-[#A0A89D] px-1 font-mono">
              <span>Local Origin: [0, 0, 0] (Lower Corner)</span>
              <span>Total Volume: {width * height * depth} m³</span>
            </div>
          </div>
        </div>

        {/* Right Column: Build Metadata, Materials & Primary CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 space-y-6">
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#1D231D] text-[#79D45B] border border-[#2A3229]">
                  {blueprint.category}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#242D24] text-[#F3F5EF] border border-[#2A3229]">
                  {blueprint.difficulty} Difficulty
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5EF]">
                {blueprint.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#A0A89D] leading-relaxed">
                {blueprint.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#1D231D] border border-[#2A3229] rounded-xl p-3 text-center">
                <div className="text-xs text-[#A0A89D] flex items-center justify-center gap-1">
                  <Box className="w-3.5 h-3.5 text-[#79D45B]" /> Bounding Box
                </div>
                <div className="text-base font-extrabold font-mono text-[#F3F5EF] mt-1">
                  {width}W × {height}H × {depth}D
                </div>
              </div>
              <div className="bg-[#1D231D] border border-[#2A3229] rounded-xl p-3 text-center">
                <div className="text-xs text-[#A0A89D] flex items-center justify-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#79D45B]" /> Placed Blocks
                </div>
                <div className="text-base font-extrabold font-mono text-[#79D45B] mt-1">
                  {blueprint.blocks.length}
                </div>
              </div>
            </div>

            {/* Edition Compatibility */}
            <div className="space-y-2 pt-2 border-t border-[#1D231D]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A0A89D]">
                Supported Editions
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D231D] border border-[#2A3229] text-xs font-medium text-[#F3F5EF]">
                  <Check className="w-3.5 h-3.5 text-[#79D45B]" /> Java 1.20+
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D231D] border border-[#2A3229] text-xs font-medium text-[#F3F5EF]">
                  <Check className="w-3.5 h-3.5 text-[#79D45B]" /> Bedrock
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D231D] border border-[#2A3229] text-xs font-medium text-[#79D45B]">
                  <Check className="w-3.5 h-3.5 text-[#79D45B]" /> Mobile
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <Link
                to={`/generate/${blueprint.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-extrabold text-base transition-all shadow-[0_4px_20px_rgba(121,212,91,0.25)] hover:shadow-[0_6px_28px_rgba(121,212,91,0.4)] active:scale-[0.99]"
              >
                Generate at Coordinates
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
              <p className="text-center text-[11px] text-[#A0A89D] mt-2 font-mono">
                Input your world X, Y, Z to generate commands or datapack
              </p>
            </div>
          </div>

          {/* Prerequisites and Limitations Card */}
          <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-[#F3F5EF] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#79D45B]" /> Gameplay Requirements
            </h4>
            <div className="space-y-1.5 text-[#A0A89D] leading-relaxed">
              <p>
                <strong className="text-[#F3F5EF]">Permissions:</strong> Cheats must be enabled in your world to execute <code className="text-[#79D45B] font-mono">/fill</code> or <code className="text-[#79D45B] font-mono">/function</code>.
              </p>
              {blueprint.limitations && (
                <p>
                  <strong className="text-[#F3F5EF]">Note:</strong> {blueprint.limitations}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Materials & Block Breakdown Section */}
      <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-[#F3F5EF] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#79D45B]" /> Material Palette ({materials.length} unique block types)
        </h3>
        <p className="text-xs text-[#A0A89D]">
          These are the exact blocks and quantities that will be placed when constructing this blueprint:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {materials.map((m) => (
            <div
              key={m.fullName}
              className="flex items-center justify-between p-3 rounded-xl bg-[#1D231D] border border-[#2A3229] text-xs"
            >
              <div className="font-mono text-[#F3F5EF] capitalize truncate mr-2">
                {m.block.replace(/_/g, ' ')}
              </div>
              <span className="font-mono text-[#79D45B] bg-[#242D24] px-2 py-0.5 rounded border border-[#2A3229] font-bold">
                ×{m.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
