import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Menu, X, Hammer, Compass, Info, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Builds', path: '/builds', icon: Box },
    { name: 'How It Works', path: '/#how-it-works', icon: Compass },
    { name: 'Admin Portal', path: '/admin', icon: Shield },
    { name: 'About', path: '/about', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.slice(1);
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0D0F0D]/90 backdrop-blur-md border-b border-[#2A3229]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#151915] border border-[#2A3229] flex items-center justify-center group-hover:border-[#79D45B] transition-colors shadow-sm">
              <Hammer className="w-5 h-5 text-[#79D45B] transform -rotate-12 group-hover:rotate-0 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-[#F3F5EF] flex items-center gap-1.5">
                BLOCKFORGE
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#79D45B]/15 text-[#79D45B] border border-[#79D45B]/30">
                  v1.0
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#79D45B] bg-[#151915]'
                      : 'text-[#A0A89D] hover:text-[#F3F5EF] hover:bg-[#151915]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/builds"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-semibold text-sm transition-all shadow-[0_2px_10px_rgba(121,212,91,0.2)] hover:shadow-[0_4px_16px_rgba(121,212,91,0.35)] active:translate-y-0.5"
            >
              <Box className="w-4 h-4" />
              Explore Builds
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#A0A89D] hover:text-[#F3F5EF] hover:bg-[#151915] border border-transparent hover:border-[#2A3229]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#151915] border-b border-[#2A3229] px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-[#79D45B] bg-[#1D231D]'
                    : 'text-[#A0A89D] hover:text-[#F3F5EF] hover:bg-[#1D231D]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              to="/builds"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#79D45B] text-[#0D0F0D] font-semibold text-sm shadow-sm"
            >
              <Box className="w-4 h-4" />
              Explore Builds
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
