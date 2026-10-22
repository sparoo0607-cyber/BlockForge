import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ALL_BLUEPRINTS, BLUEPRINT_CATEGORIES, filterBlueprints, type BlueprintCategory } from '../data/blueprints';
import { BuildCard } from '../components/builds/BuildCard';
import { Search, Filter, ArrowUpDown, Box, RefreshCcw } from 'lucide-react';
import type { Edition } from '../types/blueprint';

export const BuildCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = (searchParams.get('category') as BlueprintCategory) || 'All';
  const [selectedCategory, setSelectedCategory] = useState<BlueprintCategory>(
    BLUEPRINT_CATEGORIES.includes(initialCategory) ? initialCategory : 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdition, setSelectedEdition] = useState<Edition | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size-asc' | 'size-desc' | 'difficulty'>('name');

  // Handle URL query sync
  const handleCategoryChange = (cat: BlueprintCategory) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const filteredBuilds = useMemo(() => {
    return filterBlueprints({
      search: searchQuery,
      category: selectedCategory,
      edition: selectedEdition,
      sortBy,
    });
  }, [searchQuery, selectedCategory, selectedEdition, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedEdition('all');
    setSortBy('name');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#151915] border border-[#2A3229] text-xs font-mono text-[#79D45B]">
          <Box className="w-3.5 h-3.5" />
          <span>Curated Structure Catalogue</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3F5EF] tracking-tight">
          Premade Minecraft Builds
        </h1>
        <p className="text-sm text-[#A0A89D] max-w-2xl leading-relaxed">
          Every structure is stored as an exact, validated machine-readable blueprint. Select any build to inspect its dimensions and generate coordinate-translated commands.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-[#151915] border border-[#2A3229] rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#A0A89D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by structure name or tag..."
              className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F3F5EF] placeholder-[#A0A89D]/60 focus:outline-none focus:border-[#79D45B] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A0A89D] hover:text-[#F3F5EF]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Edition Filter */}
          <div className="md:col-span-3">
            <div className="flex items-center rounded-lg bg-[#1D231D] border border-[#2A3229] p-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedEdition('all')}
                className={`flex-1 py-1.5 rounded text-center font-medium transition-colors ${
                  selectedEdition === 'all'
                    ? 'bg-[#242D24] text-[#79D45B] shadow-xs'
                    : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                All Editions
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition('java')}
                className={`flex-1 py-1.5 rounded text-center font-medium transition-colors ${
                  selectedEdition === 'java'
                    ? 'bg-[#242D24] text-[#79D45B] shadow-xs'
                    : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                Java
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition('bedrock')}
                className={`flex-1 py-1.5 rounded text-center font-medium transition-colors ${
                  selectedEdition === 'bedrock'
                    ? 'bg-[#242D24] text-[#79D45B] shadow-xs'
                    : 'text-[#A0A89D] hover:text-[#F3F5EF]'
                }`}
              >
                Bedrock
              </button>
            </div>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#A0A89D] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2.5 text-xs text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
            >
              <option value="name">Sort: Name (A to Z)</option>
              <option value="size-asc">Sort: Size (Smallest first)</option>
              <option value="size-desc">Sort: Size (Largest first)</option>
              <option value="difficulty">Sort: Difficulty</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[#A0A89D] font-mono shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {BLUEPRINT_CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? ALL_BLUEPRINTS.length
                : ALL_BLUEPRINTS.filter((b) => b.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#79D45B]/15 text-[#79D45B] border-[#79D45B]/40 shadow-xs'
                    : 'bg-[#1D231D] text-[#A0A89D] border-[#2A3229] hover:text-[#F3F5EF] hover:border-[#3E4B3D]'
                }`}
              >
                {cat} <span className="opacity-60 ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-[#A0A89D]">
        <span>
          Showing <span className="text-[#F3F5EF] font-semibold">{filteredBuilds.length}</span> of{' '}
          {ALL_BLUEPRINTS.length} structures
        </span>
        {(searchQuery || selectedCategory !== 'All' || selectedEdition !== 'all') && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[#79D45B] hover:text-[#8CE26E] font-medium"
          >
            <RefreshCcw className="w-3 h-3" />
            Reset all filters
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredBuilds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuilds.map((bp) => (
            <BuildCard key={bp.id} blueprint={bp} />
          ))}
        </div>
      ) : (
        <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-[#242D24] text-[#A0A89D] border border-[#2A3229] flex items-center justify-center mx-auto">
            <Box className="w-6 h-6 text-[#A0A89D]" />
          </div>
          <h3 className="text-lg font-bold text-[#F3F5EF]">No structures match your search</h3>
          <p className="text-xs text-[#A0A89D] leading-relaxed">
            No blueprints found matching "{searchQuery}" with the selected category and edition filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#242D24] text-[#79D45B] hover:bg-[#2A3229] border border-[#2A3229] text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
