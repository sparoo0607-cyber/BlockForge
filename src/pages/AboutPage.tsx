import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Monitor,
  Smartphone,
  Box,
  Heart,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151915] border border-[#2A3229] text-xs font-mono text-[#79D45B]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Product Mission & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5EF] tracking-tight">
          About BLOCKFORGE
        </h1>
        <p className="text-base text-[#A0A89D] leading-relaxed max-w-2xl">
          BLOCKFORGE is a modern Minecraft utility designed to bridge the gap between blueprint design and actual in-game construction.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F3F5EF]">100% Free Forever</h3>
          <p className="text-xs sm:text-sm text-[#A0A89D] leading-relaxed">
            Building in Minecraft should be accessible to everyone. BLOCKFORGE has no subscriptions, no paywalled blueprints, no artificial daily limits, and no registration requirements.
          </p>
        </div>

        <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F3F5EF]">Client-Side & Private</h3>
          <p className="text-xs sm:text-sm text-[#A0A89D] leading-relaxed">
            All coordinate translations, 3D rotations, cuboid grouping optimizations, and ZIP packaging run entirely in your web browser. No telemetry or world data is sent to external servers.
          </p>
        </div>
      </div>

      {/* How the Engine Works */}
      <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#F3F5EF] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#79D45B]" /> How the Engine Works
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-[#A0A89D] leading-relaxed">
          <p>
            Traditional Minecraft tools usually provide screenshots or raw layer-by-layer schematics. BLOCKFORGE uses a deterministic mathematical pipeline:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#1D231D] border border-[#2A3229] space-y-2">
              <span className="font-bold text-[#F3F5EF] block text-xs uppercase tracking-wider text-[#79D45B]">
                1. Local Origin
              </span>
              <p className="text-xs text-[#A0A89D]">
                Every structure blueprint is authored in local coordinates relative to <code className="text-[#F3F5EF] font-mono">[0, 0, 0]</code> (the lowest corner).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1D231D] border border-[#2A3229] space-y-2">
              <span className="font-bold text-[#F3F5EF] block text-xs uppercase tracking-wider text-[#79D45B]">
                2. Coordinate Translation
              </span>
              <p className="text-xs text-[#A0A89D]">
                Your target world coordinates <code className="text-[#F3F5EF] font-mono">(ox, oy, oz)</code> are added to each local block position: <code className="text-[#79D45B] font-mono">world = origin + local</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1D231D] border border-[#2A3229] space-y-2">
              <span className="font-bold text-[#F3F5EF] block text-xs uppercase tracking-wider text-[#79D45B]">
                3. Cuboid Optimization
              </span>
              <p className="text-xs text-[#A0A89D]">
                Adjacent identical blocks are grouped into <code className="text-[#79D45B] font-mono">/fill</code> regions, slashing command counts by up to 85% without ever modifying empty space.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Editions Comparison */}
      <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-[#F3F5EF] flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#79D45B]" /> Edition Support & Dialects
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#1D231D] border border-[#2A3229] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#F3F5EF] flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#79D45B]" /> Minecraft Java Edition
              </h4>
              <span className="text-xs font-mono text-[#79D45B]">1.20 - 1.21+</span>
            </div>
            <p className="text-xs text-[#A0A89D] leading-relaxed">
              Uses brackets for block states (<code className="text-[#79D45B] font-mono">minecraft:oak_stairs[facing=north,half=bottom]</code>). Supports both copy-paste command batches and 1-click downloadable Datapack ZIP files (<code className="text-[#79D45B] font-mono">pack.mcmeta</code> + <code className="text-[#79D45B] font-mono">build.mcfunction</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1D231D] border border-[#2A3229] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#F3F5EF] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#79D45B]" /> Minecraft Bedrock & Mobile Edition
              </h4>
              <span className="text-xs font-mono text-[#79D45B]">Windows, Consoles, iOS, Android</span>
            </div>
            <p className="text-xs text-[#A0A89D] leading-relaxed">
              Uses Bedrock syntax (<code className="text-[#79D45B] font-mono">minecraft:oak_stairs ["weirdo_direction": 3]</code>). Designed for mobile and console builders with small command batches or standalone function files.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations & Gameplay Prerequisites */}
      <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-[#F3F5EF] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> Important Limitations
        </h2>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-[#A0A89D] leading-relaxed">
          <li>
            <strong className="text-[#F3F5EF]">Cheats Enabled:</strong> You must have cheats / commands enabled in your world to execute <code className="text-[#79D45B]">/fill</code>, <code className="text-[#79D45B]">/setblock</code>, or <code className="text-[#79D45B]">/function</code>.
          </li>
          <li>
            <strong className="text-[#F3F5EF]">World Height Limits:</strong> Structures must be placed within Minecraft world height limits (<code className="text-[#79D45B]">Y = -64</code> to <code className="text-[#79D45B]">Y = 319</code>).
          </li>
          <li>
            <strong className="text-[#F3F5EF]">Loaded Chunks:</strong> Your player character must be within render/simulation distance of the target coordinates so the game engine has loaded the target chunks.
          </li>
          <li>
            <strong className="text-[#F3F5EF]">World Backups:</strong> Always back up your Minecraft worlds before executing large command batches or importing new functions!
          </li>
        </ul>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Link
          to="/builds"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Box className="w-4 h-4" /> Explore Build Library <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
