import React from 'react';
import { Link } from 'react-router-dom';
import { ALL_BLUEPRINTS, BLUEPRINT_CATEGORIES } from '../data/blueprints';
import { BuildCard } from '../components/builds/BuildCard';
import { VoxelPreview } from '../components/preview/VoxelPreview';
import {
  Box,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Monitor,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const heroBlueprint = ALL_BLUEPRINTS[1]; // Medieval Watchtower for stunning hero 3D preview
  const featuredBuilds = ALL_BLUEPRINTS.slice(0, 4);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#79D45B]/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151915] border border-[#2A3229] text-xs text-[#A0A89D]">
                <span className="w-2 h-2 rounded-full bg-[#79D45B] animate-pulse" />
                <span>Next-Gen Minecraft Structure Generator</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F3F5EF] leading-[1.1]">
                Your Build.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#79D45B] to-[#A3F088]">
                  Your Coordinates.
                </span>{' '}
                Your World.
              </h1>

              <p className="text-base sm:text-lg text-[#A0A89D] max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Choose a premade Minecraft structure, enter your exact world coordinates, and instantly generate edition-compatible commands (<code className="text-[#79D45B] font-mono">/fill</code>, <code className="text-[#79D45B] font-mono">/setblock</code>) or downloadable Java datapacks.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/builds"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-bold text-base transition-all shadow-[0_4px_20px_rgba(121,212,91,0.25)] hover:shadow-[0_6px_24px_rgba(121,212,91,0.4)] active:scale-[0.98]"
                >
                  <Box className="w-5 h-5" />
                  Explore Builds
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#151915] hover:bg-[#1D231D] text-[#F3F5EF] font-semibold text-base border border-[#2A3229] hover:border-[#3E4B3D] transition-colors"
                >
                  <Compass className="w-5 h-5 text-[#A0A89D]" />
                  How It Works
                </a>
              </div>

              {/* Edition Support Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#A0A89D]">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#79D45B]" />
                  <span>Java Edition 1.20 - 1.21+</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#79D45B]" />
                  <span>Bedrock (PC & Console)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#79D45B]" />
                  <span>Mobile Friendly (iOS/Android)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Hero Preview */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#79D45B]/20 to-transparent blur-md -z-10" />
                <div className="bg-[#151915] p-3 rounded-2xl border border-[#2A3229] shadow-2xl">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A3229] mb-2 text-xs">
                    <span className="font-semibold text-[#F3F5EF] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#79D45B]" />
                      Interactive 3D Voxel Preview
                    </span>
                    <span className="text-[#A0A89D] text-[11px]">Drag to rotate • Scroll to zoom</span>
                  </div>
                  <VoxelPreview blueprint={heroBlueprint} height={380} />
                  <div className="mt-3 flex items-center justify-between px-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#F3F5EF]">{heroBlueprint.name}</span>
                      <span className="text-[#A0A89D] ml-2 font-mono">{heroBlueprint.dimensions.width}x{heroBlueprint.dimensions.height}x{heroBlueprint.dimensions.depth}</span>
                    </div>
                    <Link
                      to={`/generate/${heroBlueprint.slug}`}
                      className="text-xs font-semibold text-[#79D45B] hover:text-[#8CE26E] flex items-center gap-1"
                    >
                      Generate this build <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#79D45B]">
            Simple 3-Step Process
          </h2>
          <h3 className="text-3xl font-extrabold text-[#F3F5EF]">
            How BLOCKFORGE Works
          </h3>
          <p className="text-sm text-[#A0A89D] max-w-xl mx-auto">
            No mods required. No live server connection required. Clean, safe Minecraft commands translated directly to your target world location.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#151915] border border-[#2A3229] rounded-xl p-6 space-y-4 hover:border-[#3E4B3D] transition-colors relative">
            <div className="w-10 h-10 rounded-lg bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-lg">
              1
            </div>
            <h4 className="text-lg font-bold text-[#F3F5EF]">Select a Build</h4>
            <p className="text-sm text-[#A0A89D] leading-relaxed">
              Browse our curated library of starter homes, towers, bridges, castles, and modern structures. Review blueprints and exact dimensions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#151915] border border-[#2A3229] rounded-xl p-6 space-y-4 hover:border-[#3E4B3D] transition-colors relative">
            <div className="w-10 h-10 rounded-lg bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-lg">
              2
            </div>
            <h4 className="text-lg font-bold text-[#F3F5EF]">Enter Your Coordinates</h4>
            <p className="text-sm text-[#A0A89D] leading-relaxed">
              Type your target world X, Y, and Z. Choose your edition (Java, Bedrock, or Mobile) and optionally rotate the structure 90°, 180°, or 270°.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#151915] border border-[#2A3229] rounded-xl p-6 space-y-4 hover:border-[#3E4B3D] transition-colors relative">
            <div className="w-10 h-10 rounded-lg bg-[#242D24] text-[#79D45B] border border-[#2A3229] flex items-center justify-center font-mono font-bold text-lg">
              3
            </div>
            <h4 className="text-lg font-bold text-[#F3F5EF]">Generate & Build</h4>
            <p className="text-sm text-[#A0A89D] leading-relaxed">
              Copy smart cuboid-optimized command batches or download a ready-to-run Java Datapack (.zip) or function file. Run in-game with cheats enabled!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Builds Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#79D45B]">
              Verified Blueprints
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5EF] mt-1">
              Featured Structures
            </h3>
          </div>
          <Link
            to="/builds"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#79D45B] hover:text-[#8CE26E] transition-colors"
          >
            View all {ALL_BLUEPRINTS.length} structures <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBuilds.map((bp) => (
            <BuildCard key={bp.id} blueprint={bp} />
          ))}
        </div>
      </section>

      {/* Category Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl font-extrabold text-[#F3F5EF]">
              Browse By Category
            </h3>
            <p className="text-sm text-[#A0A89D]">
              Whether you need an instant survival starter house or a sprawling medieval stone fortress, find the blueprint that matches your world.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {BLUEPRINT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <Link
                key={cat}
                to={`/builds?category=${encodeURIComponent(cat)}`}
                className="p-4 rounded-xl bg-[#1D231D] hover:bg-[#242D24] border border-[#2A3229] hover:border-[#79D45B]/40 transition-all text-center group"
              >
                <div className="font-bold text-sm text-[#F3F5EF] group-hover:text-[#79D45B] transition-colors">
                  {cat}
                </div>
                <div className="text-xs text-[#A0A89D] mt-1 font-mono">
                  {ALL_BLUEPRINTS.filter((b) => b.category === cat).length} {ALL_BLUEPRINTS.filter((b) => b.category === cat).length === 1 ? 'build' : 'builds'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Free & Open Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#2A3229] rounded-2xl bg-gradient-to-r from-[#151915] via-[#1A201A] to-[#151915] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#79D45B] font-mono text-xs font-semibold uppercase">
              <CheckCircle2 className="w-4 h-4" /> Free Forever • No Paywalls
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-[#F3F5EF]">
              Pure Client-Side Generation
            </h4>
            <p className="text-sm text-[#A0A89D] max-w-xl">
              All coordinates, cuboid grouping algorithms, and datapack zip archives are generated entirely inside your browser. No data collection, no account required.
            </p>
          </div>

          <Link
            to="/builds"
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Start Building Now
          </Link>
        </div>
      </section>
    </div>
  );
};
