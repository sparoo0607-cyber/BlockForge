import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Terminal, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090B09] border-t border-[#2A3229] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#151915] border border-[#2A3229] flex items-center justify-center">
                <Hammer className="w-4 h-4 text-[#79D45B]" />
              </div>
              <span className="font-extrabold text-lg text-[#F3F5EF] tracking-tight">
                BLOCKFORGE
              </span>
            </Link>
            <p className="text-sm text-[#A0A89D] max-w-md leading-relaxed">
              The premier client-side Minecraft structure generator. Select curated blueprints, enter your exact world coordinates, and instantly generate optimized commands and downloadable datapacks for Java, Bedrock, and Mobile.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#A0A89D] pt-2">
              <span className="flex items-center gap-1.5 text-[#79D45B]">
                <ShieldCheck className="w-4 h-4" /> 100% Free & Open
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Client-Side Only
              </span>
              <span>•</span>
              <span>No AI or Accounts</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F5EF]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#A0A89D]">
              <li>
                <Link to="/builds" className="hover:text-[#79D45B] transition-colors">
                  Build Library
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-[#79D45B] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#79D45B] transition-colors">
                  About & Supported Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Editions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F5EF]">
              Game Editions
            </h4>
            <div className="space-y-2 text-sm text-[#A0A89D]">
              <div className="flex items-center justify-between py-1 border-b border-[#1D231D]">
                <span>Java Edition</span>
                <span className="text-xs text-[#79D45B] font-mono">1.20 - 1.21+</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1D231D]">
                <span>Bedrock Edition</span>
                <span className="text-xs text-[#79D45B] font-mono">PC & Consoles</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Mobile (Bedrock)</span>
                <span className="text-xs text-[#79D45B] font-mono">iOS & Android</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 mt-8 border-t border-[#1D231D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A0A89D]">
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Minecraft builders worldwide.
          </p>
          <p className="text-center sm:text-right">
            Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
          </p>
        </div>
      </div>
    </footer>
  );
};
