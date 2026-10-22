import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BUILTIN_BLUEPRINTS, getAllBlueprints, type BlueprintCategory } from '../data/blueprints';
import {
  getCustomBlueprints,
  saveCustomBlueprint,
  deleteCustomBlueprint,
  isAdminAuthenticated,
  setAdminAuthenticated,
  exportBlueprintAsJson,
} from '../services/customBuildsStorage';
import { validateBlueprint } from '../engine/blueprintValidator';
import { parseMinecraftCommands } from '../engine/commandParser';
import { VoxelPreview } from '../components/preview/VoxelPreview';
import type { BuildBlueprint, BlockPlacement, Edition } from '../types/blueprint';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  Layers,
  Terminal,
  Grid,
  Sparkles,
  ArrowRight,
  Eye,
  FileCode,
} from 'lucide-react';

const COMMON_BLOCKS = [
  { id: 'minecraft:oak_planks', name: 'Oak Planks', color: '#B88748' },
  { id: 'minecraft:oak_log', name: 'Oak Log', color: '#6B5130' },
  { id: 'minecraft:cobblestone', name: 'Cobblestone', color: '#6E6E6E' },
  { id: 'minecraft:stone_bricks', name: 'Stone Bricks', color: '#5A5D5A' },
  { id: 'minecraft:spruce_planks', name: 'Spruce Planks', color: '#684E32' },
  { id: 'minecraft:smooth_quartz', name: 'Smooth Quartz', color: '#E8E3D9' },
  { id: 'minecraft:white_concrete', name: 'White Concrete', color: '#ECECEE' },
  { id: 'minecraft:gray_concrete', name: 'Gray Concrete', color: '#373A3E' },
  { id: 'minecraft:glass_pane', name: 'Glass Pane', color: '#88C0D0' },
  { id: 'minecraft:iron_bars', name: 'Iron Bars', color: '#90989F' },
  { id: 'minecraft:lantern', name: 'Lantern', color: '#F5B041' },
  { id: 'minecraft:oak_leaves', name: 'Oak Leaves', color: '#3B6F22' },
];

export const AdminPortalPage: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(isAdminAuthenticated());
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin View State
  const [activeTab, setActiveTab] = useState<'manage' | 'create'>('manage');
  const [refreshKey, setRefreshKey] = useState(0);

  // New Build Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BlueprintCategory>('Houses');
  const [difficulty, setDifficulty] = useState<'Starter' | 'Intermediate' | 'Advanced'>('Starter');
  const [width, setWidth] = useState(5);
  const [height, setHeight] = useState(5);
  const [depth, setDepth] = useState(5);
  const [tags, setTags] = useState('Custom, Survival');
  const [accentColor, setAccentColor] = useState('#79D45B');
  const [javaSupport, setJavaSupport] = useState(true);
  const [bedrockSupport, setBedrockSupport] = useState(true);

  // Block authoring mode
  const [blockMode, setBlockMode] = useState<'painter' | 'commands' | 'json'>('painter');
  const [currentY, setCurrentY] = useState(0);
  const [activeBrush, setActiveBrush] = useState(COMMON_BLOCKS[0].id);
  const [customBrushInput, setCustomBrushInput] = useState('');
  const [blocks, setBlocks] = useState<BlockPlacement[]>([
    { pos: [0, 0, 0], block: 'minecraft:cobblestone' },
  ]);

  // Raw command input
  const [commandsInput, setCommandsInput] = useState('');
  const [commandParseErrors, setCommandParseErrors] = useState<string[]>([]);

  // Raw JSON input
  const [jsonInput, setJsonInput] = useState('');
  const [jsonParseError, setJsonParseError] = useState('');

  // Feedback states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dynamic builds list
  const allBuilds = useMemo(() => {
    return getAllBlueprints(true);
  }, [refreshKey]);

  const customBuilds = useMemo(() => {
    return getCustomBlueprints();
  }, [refreshKey]);

  // Construct draft blueprint for validation and preview
  const draftBlueprint: BuildBlueprint = useMemo(() => {
    const supportedEditions: Edition[] = [];
    if (javaSupport) supportedEditions.push('java');
    if (bedrockSupport) supportedEditions.push('bedrock');

    return {
      id: slug || 'new-build',
      slug: slug || 'new-build',
      name: name || 'New Custom Build',
      description: description || 'A custom Minecraft structure blueprint.',
      category: category === 'All' ? 'Houses' : category,
      dimensions: { width, height, depth },
      origin: [0, 0, 0],
      blocks,
      supportedEditions: supportedEditions.length > 0 ? supportedEditions : ['java', 'bedrock'],
      estimatedBlockCount: blocks.length,
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      accentColor,
    };
  }, [slug, name, description, category, width, height, depth, blocks, javaSupport, bedrockSupport, difficulty, tags, accentColor]);

  // Validation
  const validationResult = useMemo(() => {
    return validateBlueprint(draftBlueprint);
  }, [draftBlueprint]);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  // Auth unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'admin' || passcode.trim() === 'blockforge' || passcode.trim() === '') {
      setIsAuth(true);
      setAdminAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid passcode. (Tip: Enter "blockforge" or leave blank for instant admin access)');
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    setAdminAuthenticated(false);
  };

  // Grid Painter click
  const handleGridCellClick = (x: number, z: number) => {
    const brush = customBrushInput.trim() || activeBrush;
    const existingIndex = blocks.findIndex((b) => b.pos[0] === x && b.pos[1] === currentY && b.pos[2] === z);

    if (existingIndex >= 0) {
      if (blocks[existingIndex].block === brush) {
        // Erase
        setBlocks(blocks.filter((_, idx) => idx !== existingIndex));
      } else {
        // Replace
        const updated = [...blocks];
        updated[existingIndex] = { pos: [x, currentY, z], block: brush };
        setBlocks(updated);
      }
    } else {
      // Place
      setBlocks([...blocks, { pos: [x, currentY, z], block: brush }]);
    }
  };

  // Command Parser Run
  const handleParseCommands = () => {
    setCommandParseErrors([]);
    const res = parseMinecraftCommands(commandsInput);
    if (res.errors.length > 0) {
      setCommandParseErrors(res.errors);
    }
    if (res.blocks.length > 0) {
      setBlocks(res.blocks);
      setWidth(res.dimensions.width);
      setHeight(res.dimensions.height);
      setDepth(res.dimensions.depth);
    }
  };

  // JSON Parser Run
  const handleParseJson = () => {
    setJsonParseError('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setBlocks(parsed);
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
        if (parsed.name) setName(parsed.name);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.dimensions) {
          setWidth(parsed.dimensions.width);
          setHeight(parsed.dimensions.height);
          setDepth(parsed.dimensions.depth);
        }
        setBlocks(parsed.blocks);
      } else {
        setJsonParseError('JSON must be an array of blocks or a complete BuildBlueprint object');
      }
    } catch (err: any) {
      setJsonParseError(`JSON parse error: ${err.message}`);
    }
  };

  // Save Build
  const handleSaveBuild = () => {
    setSaveError(null);
    setSaveSuccess(false);

    const res = saveCustomBlueprint(draftBlueprint);
    if (res.success) {
      setSaveSuccess(true);
      setRefreshKey((k) => k + 1);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('manage');
      }, 1500);
    } else {
      setSaveError(res.error || 'Failed to save blueprint');
    }
  };

  // Delete Build
  const handleDeleteBuild = (id: string, buildName: string) => {
    if (window.confirm(`Are you sure you want to delete custom build "${buildName}"?`)) {
      deleteCustomBlueprint(id);
      setRefreshKey((k) => k + 1);
    }
  };

  // Import JSON File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = saveCustomBlueprint(parsed);
        if (res.success) {
          setRefreshKey((k) => k + 1);
          alert(`Successfully imported "${parsed.name}"!`);
        } else {
          alert(`Import validation failed: ${res.error}`);
        }
      } catch (err: any) {
        alert(`Failed to parse file as JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // If not authenticated, show passcode unlock screen
  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 space-y-6">
        <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-8 space-y-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#242D24] border border-[#2A3229] flex items-center justify-center mx-auto text-[#79D45B]">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-[#F3F5EF]">Admin Portal</h1>
            <p className="text-xs text-[#A0A89D]">
              Authorized portal for creating and managing Minecraft structure blueprints.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label htmlFor="passcode" className="block text-xs font-mono text-[#A0A89D] mb-1">
                Admin Passcode
              </label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode or click Unlock..."
                className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3.5 py-2.5 text-sm text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              Unlock Admin Portal
            </button>
            <p className="text-[11px] text-center text-[#A0A89D]/70 font-mono">
              Press Enter or Unlock to proceed
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A3229]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#79D45B]">
            <ShieldCheck className="w-4 h-4" /> Admin Access Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5EF]">
            BLOCKFORGE Admin Portal
          </h1>
          <p className="text-xs text-[#A0A89D]">
            Manage catalogue blueprints, author new structures with live 3D preview, and export JSON.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-[#1D231D] hover:bg-[#242D24] border border-[#2A3229] text-xs font-medium text-[#A0A89D] hover:text-[#F3F5EF]"
          >
            Lock Portal
          </button>
          <Link
            to="/builds"
            className="px-3 py-1.5 rounded-lg bg-[#242D24] text-[#79D45B] border border-[#2A3229] text-xs font-semibold hover:bg-[#2A3229]"
          >
            View Public Site
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3229] pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'manage'
              ? 'bg-[#79D45B]/15 text-[#79D45B] border border-[#79D45B]/30'
              : 'text-[#A0A89D] hover:text-[#F3F5EF] hover:bg-[#151915]'
          }`}
        >
          <Layers className="w-4 h-4" /> Manage Builds ({allBuilds.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'create'
              ? 'bg-[#79D45B]/15 text-[#79D45B] border border-[#79D45B]/30'
              : 'text-[#A0A89D] hover:text-[#F3F5EF] hover:bg-[#151915]'
          }`}
        >
          <Plus className="w-4 h-4" /> Author New Build
        </button>
      </div>

      {/* Tab 1: Manage Builds */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#151915] border border-[#2A3229]">
            <div className="text-xs text-[#A0A89D]">
              <span className="text-[#F3F5EF] font-bold">{BUILTIN_BLUEPRINTS.length} Built-in</span> systems +{' '}
              <span className="text-[#79D45B] font-bold">{customBuilds.length} Custom Admin</span> structures
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#1D231D] hover:bg-[#242D24] border border-[#2A3229] text-xs font-medium text-[#F3F5EF] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#79D45B]" />
                Import Blueprint (.json)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-1.5 rounded-lg bg-[#79D45B] hover:bg-[#8CE26E] text-[#0D0F0D] text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Build
              </button>
            </div>
          </div>

          {/* Builds Table */}
          <div className="bg-[#151915] border border-[#2A3229] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121612] border-b border-[#2A3229] text-[#A0A89D] uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Structure</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Blocks</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D231D]">
                  {allBuilds.map((bp) => {
                    const isCustom = customBuilds.some((c) => c.id === bp.id || c.slug === bp.slug);

                    return (
                      <tr key={bp.id} className="hover:bg-[#182018] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#F3F5EF]">{bp.name}</div>
                          <div className="text-[11px] text-[#A0A89D] font-mono">{bp.slug}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#A0A89D]">{bp.category}</td>
                        <td className="py-3.5 px-4 font-mono text-[#F3F5EF]">
                          {bp.dimensions.width}×{bp.dimensions.height}×{bp.dimensions.depth}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#79D45B] font-bold">
                          {bp.blocks.length}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              isCustom
                                ? 'bg-[#79D45B]/15 text-[#79D45B] border border-[#79D45B]/30'
                                : 'bg-[#1D231D] text-[#A0A89D] border border-[#2A3229]'
                            }`}
                          >
                            {isCustom ? 'Custom' : 'System'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <Link
                            to={`/builds/${bp.slug}`}
                            className="p-1.5 rounded hover:bg-[#242D24] text-[#A0A89D] hover:text-[#F3F5EF] inline-block"
                            title="Preview in Catalog"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/generate/${bp.slug}`}
                            className="p-1.5 rounded hover:bg-[#242D24] text-[#79D45B] inline-block"
                            title="Open in Generator"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => exportBlueprintAsJson(bp)}
                            className="p-1.5 rounded hover:bg-[#242D24] text-[#A0A89D] hover:text-[#F3F5EF]"
                            title="Download JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBuild(bp.id, bp.name)}
                              className="p-1.5 rounded hover:bg-red-950/40 text-red-400"
                              title="Delete Build"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Author New Build */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Metadata & Block Editor */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-[#F3F5EF] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#79D45B]" /> Structure Blueprint Specifications
              </h2>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label htmlFor="build-name" className="block font-semibold text-[#A0A89D]">Structure Name</label>
                  <input
                    id="build-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Desert Watchpost"
                    required
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="build-slug" className="block font-semibold text-[#A0A89D]">URL Slug (lowercase)</label>
                  <input
                    id="build-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="desert-watchpost"
                    required
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 font-mono text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="build-desc" className="block font-semibold text-[#A0A89D]">Description</label>
                  <textarea
                    id="build-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe structure materials, purpose, and visual aesthetic..."
                    rows={2}
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="build-cat" className="block font-semibold text-[#A0A89D]">Category</label>
                  <select
                    id="build-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  >
                    <option value="Houses">Houses</option>
                    <option value="Castles">Castles</option>
                    <option value="Towers">Towers</option>
                    <option value="Bridges">Bridges</option>
                    <option value="Modern Builds">Modern Builds</option>
                    <option value="Farms">Farms</option>
                    <option value="Decorations">Decorations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="build-diff" className="block font-semibold text-[#A0A89D]">Difficulty</label>
                  <select
                    id="build-diff"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="build-tags" className="block font-semibold text-[#A0A89D]">Tags (comma separated)</label>
                  <input
                    id="build-tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Custom, Starter, Stone"
                    className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="build-accent" className="block font-semibold text-[#A0A89D]">Accent Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="build-accent"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-[#1D231D] border border-[#2A3229] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 font-mono text-[#F3F5EF]"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="block font-semibold text-[#A0A89D]">Supported Minecraft Editions</span>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#F3F5EF]">
                      <input
                        type="checkbox"
                        checked={javaSupport}
                        onChange={(e) => setJavaSupport(e.target.checked)}
                        className="rounded border-[#2A3229] text-[#79D45B] focus:ring-[#79D45B]"
                      />
                      Java Edition (1.20+)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[#F3F5EF]">
                      <input
                        type="checkbox"
                        checked={bedrockSupport}
                        onChange={(e) => setBedrockSupport(e.target.checked)}
                        className="rounded border-[#2A3229] text-[#79D45B] focus:ring-[#79D45B]"
                      />
                      Bedrock / Mobile Edition
                    </label>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2 pt-2 border-t border-[#1D231D]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A0A89D]">
                  Dimensions (Bounding Box)
                </span>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label htmlFor="dim-w" className="block text-[11px] font-mono text-[#A0A89D]">Width (X)</label>
                    <input
                      id="dim-w"
                      type="number"
                      min={1}
                      max={64}
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 font-mono text-[#F3F5EF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="dim-h" className="block text-[11px] font-mono text-[#A0A89D]">Height (Y)</label>
                    <input
                      id="dim-h"
                      type="number"
                      min={1}
                      max={64}
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 font-mono text-[#F3F5EF]"
                    />
                  </div>
                  <div>
                    <label htmlFor="dim-d" className="block text-[11px] font-mono text-[#A0A89D]">Depth (Z)</label>
                    <input
                      id="dim-d"
                      type="number"
                      min={1}
                      max={64}
                      value={depth}
                      onChange={(e) => setDepth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#1D231D] border border-[#2A3229] rounded-lg px-3 py-2 font-mono text-[#F3F5EF]"
                    />
                  </div>
                </div>
              </div>

              {/* Block Input Mode Switcher */}
              <div className="space-y-4 pt-2 border-t border-[#1D231D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A0A89D]">
                    Block Placements ({blocks.length} blocks)
                  </span>
                  <div className="flex items-center rounded-lg bg-[#1D231D] border border-[#2A3229] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setBlockMode('painter')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        blockMode === 'painter' ? 'bg-[#242D24] text-[#79D45B]' : 'text-[#A0A89D]'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5 inline mr-1" /> Grid Painter
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockMode('commands')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        blockMode === 'commands' ? 'bg-[#242D24] text-[#79D45B]' : 'text-[#A0A89D]'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 inline mr-1" /> Commands Parser
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockMode('json')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        blockMode === 'json' ? 'bg-[#242D24] text-[#79D45B]' : 'text-[#A0A89D]'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 inline mr-1" /> JSON
                    </button>
                  </div>
                </div>

                {/* Mode A: Visual 2D Grid Painter */}
                {blockMode === 'painter' && (
                  <div className="space-y-3">
                    {/* Y Layer Selector */}
                    <div className="flex items-center justify-between bg-[#1D231D] p-2.5 rounded-xl border border-[#2A3229] text-xs">
                      <span className="font-mono text-[#A0A89D]">Current Layer:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-none">
                        {Array.from({ length: Math.min(height, 24) }).map((_, y) => (
                          <button
                            key={y}
                            type="button"
                            onClick={() => setCurrentY(y)}
                            className={`w-7 h-7 rounded font-mono font-bold text-xs transition-colors ${
                              currentY === y
                                ? 'bg-[#79D45B] text-[#0D0F0D]'
                                : 'bg-[#242D24] text-[#A0A89D] hover:text-[#F3F5EF]'
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Block Brush Palette */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#A0A89D]">Select Brush:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {COMMON_BLOCKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setActiveBrush(b.id);
                              setCustomBrushInput('');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
                              activeBrush === b.id && !customBrushInput
                                ? 'bg-[#79D45B]/20 border-[#79D45B] text-[#79D45B] font-bold'
                                : 'bg-[#1D231D] border-[#2A3229] text-[#A0A89D] hover:text-[#F3F5EF]'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2D Grid Display for current Y */}
                    <div className="bg-[#111511] p-3 rounded-xl border border-[#2A3229] overflow-x-auto">
                      <div className="text-[11px] text-[#A0A89D] mb-2 flex items-center justify-between">
                        <span>Layer Y={currentY} (Click cell to place/remove)</span>
                        <button
                          type="button"
                          onClick={() => setBlocks(blocks.filter((b) => b.pos[1] !== currentY))}
                          className="text-red-400 hover:underline"
                        >
                          Clear layer Y={currentY}
                        </button>
                      </div>

                      <div
                        className="grid gap-1 select-none"
                        style={{
                          gridTemplateColumns: `repeat(${width}, minmax(24px, 32px))`,
                          width: 'max-content',
                        }}
                      >
                        {Array.from({ length: depth }).map((_, z) =>
                          Array.from({ length: width }).map((_, x) => {
                            const placed = blocks.find(
                              (b) => b.pos[0] === x && b.pos[1] === currentY && b.pos[2] === z
                            );

                            return (
                              <button
                                key={`${x},${z}`}
                                type="button"
                                onClick={() => handleGridCellClick(x, z)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded border transition-colors flex items-center justify-center text-[10px] font-mono ${
                                  placed
                                    ? 'bg-[#79D45B]/30 border-[#79D45B] text-[#F3F5EF]'
                                    : 'bg-[#1D231D] border-[#2A3229] hover:bg-[#242D24] text-transparent'
                                }`}
                                title={`Pos: (${x}, ${currentY}, ${z})${placed ? ` - ${placed.block}` : ''}`}
                              >
                                {placed ? '■' : '·'}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode B: Command Parser */}
                {blockMode === 'commands' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#A0A89D]">
                      Paste raw Minecraft <code className="text-[#79D45B]">/fill</code> or <code className="text-[#79D45B]">/setblock</code> commands. Coordinates will be normalized automatically:
                    </p>
                    <textarea
                      value={commandsInput}
                      onChange={(e) => setCommandsInput(e.target.value)}
                      placeholder="/fill 0 0 0 4 0 4 minecraft:cobblestone&#10;/setblock 2 1 0 minecraft:oak_door[facing=south,half=lower]"
                      rows={5}
                      className="w-full bg-[#111511] border border-[#2A3229] rounded-xl p-3 font-mono text-xs text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleParseCommands}
                        className="px-4 py-2 rounded-lg bg-[#242D24] text-[#79D45B] hover:bg-[#2A3229] border border-[#2A3229] font-semibold"
                      >
                        Convert Commands to Blocks
                      </button>
                      {commandParseErrors.length > 0 && (
                        <span className="text-red-400">{commandParseErrors.length} errors</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode C: Raw JSON */}
                {blockMode === 'json' && (
                  <div className="space-y-3 text-xs">
                    <p className="text-[#A0A89D]">
                      Paste raw JSON array of block placements or full blueprint JSON:
                    </p>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='[{"pos":[0,0,0],"block":"minecraft:cobblestone"}]'
                      rows={5}
                      className="w-full bg-[#111511] border border-[#2A3229] rounded-xl p-3 font-mono text-xs text-[#F3F5EF] focus:outline-none focus:border-[#79D45B]"
                    />
                    {jsonParseError && (
                      <div className="text-red-400">{jsonParseError}</div>
                    )}
                    <button
                      type="button"
                      onClick={handleParseJson}
                      className="px-4 py-2 rounded-lg bg-[#242D24] text-[#79D45B] hover:bg-[#2A3229] border border-[#2A3229] font-semibold"
                    >
                      Load JSON Blocks
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live 3D Inspector & Validation */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-[#151915] border border-[#2A3229] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3229]">
                <span className="font-bold text-[#F3F5EF] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#79D45B]" /> Real-Time 3D Inspector
                </span>
                <span className="font-mono text-[#79D45B] font-bold">{blocks.length} blocks</span>
              </div>

              {/* Live 3D Voxel Canvas */}
              <div className="rounded-xl overflow-hidden border border-[#2A3229]">
                <VoxelPreview
                  blueprint={draftBlueprint}
                  height={320}
                />
              </div>

              {/* Schema Validation Status */}
              <div className="p-3 rounded-xl border text-xs space-y-1.5 font-mono">
                {validationResult.valid ? (
                  <div className="flex items-center gap-2 text-[#79D45B]">
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="font-bold">Blueprint Valid: Ready for In-Game Construction</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-red-300">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Validation Issues Found:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
                      {validationResult.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Save & Feedback */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Build "{name}" saved successfully to catalog!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={!validationResult.valid || !name.trim()}
                  onClick={handleSaveBuild}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#79D45B] hover:bg-[#8CE26E] disabled:opacity-40 text-[#0D0F0D] font-extrabold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save to Catalog
                </button>

                <button
                  type="button"
                  onClick={() => exportBlueprintAsJson(draftBlueprint)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#242D24] hover:bg-[#2A3229] border border-[#2A3229] text-[#F3F5EF] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#79D45B]" /> Download Blueprint (.json)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
