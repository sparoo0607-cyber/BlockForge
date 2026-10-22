import React from 'react';
import { Link } from 'react-router-dom';
import type { BuildBlueprint } from '../../types/blueprint';
import { Box, Layers, ArrowRight } from 'lucide-react';

interface BuildCardProps {
  blueprint: BuildBlueprint;
}

export const BuildCard: React.FC<BuildCardProps> = ({ blueprint }) => {
  const { width, height, depth } = blueprint.dimensions;

  return (
    <div className="group relative flex flex-col bg-[#151915] border border-[#2A3229] rounded-xl overflow-hidden hover:border-[#3E4B3D] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex-1">
      {/* Visual Header / Block Preview Banner */}
      <div className="relative h-44 bg-gradient-to-b from-[#1D231D] to-[#121612] p-4 flex flex-col justify-between overflow-hidden border-b border-[#2A3229]">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#79D45B 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#242D24] text-[#A0A89D] border border-[#2A3229]">
            {blueprint.category}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#79D45B]/10 text-[#79D45B] border border-[#79D45B]/30 font-medium">
            {blueprint.difficulty}
          </span>
        </div>

        {/* Center Isometric Voxel Illustration Accent */}
        <div className="relative z-10 flex items-center justify-center py-2">
          <div className="relative w-16 h-16 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            {/* Custom stylized Minecraft 3D block representation */}
            <div className="w-12 h-12 relative">
              <div
                className="absolute inset-0 rounded-lg border-2 shadow-lg"
                style={{
                  backgroundColor: blueprint.accentColor ?? '#79D45B',
                  borderColor: '#2A3229',
                }}
              />
              <div className="absolute inset-2 border border-white/20 rounded flex items-center justify-center">
                <Box className="w-5 h-5 text-black/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spec Chips */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#A0A89D]">
          <span className="flex items-center gap-1 bg-[#0D0F0D]/70 px-2 py-1 rounded border border-[#2A3229]/60">
            <Box className="w-3.5 h-3.5 text-[#79D45B]" />
            {width}×{height}×{depth}
          </span>
          <span className="flex items-center gap-1 bg-[#0D0F0D]/70 px-2 py-1 rounded border border-[#2A3229]/60">
            <Layers className="w-3.5 h-3.5 text-[#79D45B]" />
            ~{blueprint.blocks.length} blocks
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#F3F5EF] group-hover:text-[#79D45B] transition-colors">
            <Link to={`/builds/${blueprint.slug}`}>{blueprint.name}</Link>
          </h3>
          <p className="text-xs text-[#A0A89D] mt-1.5 line-clamp-2 leading-relaxed">
            {blueprint.description}
          </p>
        </div>

        {/* Edition Compatibility Badges */}
        <div className="pt-2 border-t border-[#1D231D] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#1D231D] text-[11px] text-[#F3F5EF] font-mono border border-[#2A3229]">
              Java
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1D231D] text-[11px] text-[#F3F5EF] font-mono border border-[#2A3229]">
              Bedrock
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1D231D] text-[11px] text-[#79D45B] font-mono border border-[#2A3229]">
              Mobile
            </span>
          </div>

          <Link
            to={`/generate/${blueprint.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#79D45B] hover:text-[#8CE26E] transition-colors"
          >
            Generate
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
