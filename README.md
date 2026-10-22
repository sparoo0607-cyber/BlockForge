# BLOCKFORGE — Minecraft Build Generator V1

**Your Build. Your Coordinates. Your World.**

BLOCKFORGE is a client-side web application that allows Minecraft players to select premade structures, specify their target world coordinates, and instantly generate edition-compatible commands (`/fill`, `/setblock`) and downloadable Datapacks for **Java Edition**, **Bedrock Edition**, and **Mobile**.

---

## 🌟 Key Features

1. **Curated Blueprint Library**:
   - 5 functional, machine-readable starter blueprints:
     - **Compact Starter House**: 5×5 survival starter home with oak log frame, plank walls, glass windows, gabled roof, and hanging lantern.
     - **Medieval Watchtower**: 5×10×5 fortified outpost with stone bricks, arrow slits, overhanging spruce observation deck, and battlements.
     - **Small Stone Castle**: 9×6×9 keep with 4 elevated corner turrets, curtain walls, interior courtyard, and iron bars portcullis.
     - **Garden Bridge**: 5×5×9 arched footbridge with spruce stairs, cobblestone piers, spruce fence railings, oak leaves, and lanterns.
     - **Modern Minimalist House**: 7×6×7 two-story residence with smooth quartz, gray concrete accent, panoramic glass, and cantilevered upper suite.

2. **Coordinate Translation Engine**:
   - Accepts positive, negative, and zero world coordinates `(X, Y, Z)`.
   - Math: `worldPos = targetOrigin + rotatedLocalPos`.
   - Deterministic 3D rotation (0°, 90°, 180°, 270°) with automatic block state rotation (cardinal facing directions, stairs, doors, axis).
   - Minecraft world height boundary validation (-64 to 319) with warning alerts.

3. **Smart Cuboid Grouping & Optimization**:
   - Groups adjacent identical blocks into 3D rectangular `/fill` regions.
   - Never groups across empty space / air (zero structure distortion).
   - Enforces the Minecraft volume limit of 32,768 blocks per command.
   - Slashes command count by up to 85% compared to naive block-by-block placement.

4. **Edition Dialects**:
   - **Java Edition (1.20 - 1.21+)**: Generates bracketed block states (`minecraft:oak_stairs[facing=north,half=bottom]`).
   - **Bedrock Edition**: Generates Bedrock state syntax (`minecraft:oak_stairs ["weirdo_direction": 3, "upside_down_bit": false]`).
   - **Mobile (iOS & Android)**: Specialized mobile workflow leveraging the Bedrock engine.

5. **Genuine File Exports**:
   - **Java Datapack ZIP**: Contains valid `pack.mcmeta` (format 48 / 1.21+), `data/blockforge/function/build.mcfunction`, and `README.txt`.
   - **Standalone `.mcfunction` file**: Direct function file ready for server or behavior pack folders.
   - **Plain-text `.txt`**: Formatted command stream with metadata comments.

6. **Interactive 3D Voxel Preview**:
   - Lightweight Three.js voxel inspector with OrbitControls, camera presets, auto-rotate, and live orientation synchronization.

7. **100% Free & Client-Side**:
   - Zero databases, zero accounts, zero paywalls, zero AI dependencies. Runs entirely in the user's browser.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript (Strict Type Checking)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4 + Lucide React icons
- **Routing**: React Router v7
- **3D Rendering**: Three.js
- **Archive Generation**: JSZip
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom`

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone or navigate to the repository
cd CommandBuilds

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Tests

```bash
# Run unit and UI component tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Building for Production

```bash
npm run build
```

The production output is generated in the `dist/` directory and can be deployed directly to Vercel, Netlify, GitHub Pages, or any static host.

---

## 📁 Architecture Overview

```
src/
├── components/
│   ├── builds/
│   │   └── BuildCard.tsx           # Catalog structure card
│   ├── layout/
│   │   ├── Navbar.tsx              # Responsive navigation & mobile drawer
│   │   ├── Footer.tsx              # Footer with edition support breakdown
│   │   └── ScrollToTop.tsx         # Route change scroll reset
│   └── preview/
│       └── VoxelPreview.tsx        # Interactive 3D Three.js voxel viewer
├── data/
│   └── blueprints/
│       ├── starterHouse.ts         # Compact Starter House
│       ├── medievalWatchtower.ts   # Medieval Watchtower
│       ├── stoneCastle.ts          # Small Stone Castle
│       ├── gardenBridge.ts         # Garden Bridge
│       ├── modernHouse.ts          # Modern Minimalist House
│       └── index.ts                # Catalog index, filtering, and sorting
├── engine/
│   ├── adapters/
│   │   ├── javaAdapter.ts          # Java /fill and /setblock formatting
│   │   └── bedrockAdapter.ts       # Bedrock /fill, /setblock, and state mapping
│   ├── blueprintValidator.ts       # Schema, bounds, and duplication validation
│   ├── coordinateEngine.ts         # Translation, rotation, bounding boxes, heights
│   ├── cuboidOptimizer.ts          # 3D cuboid grouping algorithm
│   ├── commandBatcher.ts           # Safe command batch partitioning
│   ├── buildEngine.ts              # Generation orchestrator
│   └── exporters/
│       ├── datapackExporter.ts     # Java Datapack ZIP generator (JSZip)
│       └── fileDownloader.ts       # Browser file download helpers
├── pages/
│   ├── HomePage.tsx                # Hero, showcase, how it works, categories
│   ├── BuildCatalogPage.tsx        # Search, filter, sort, and catalog grid
│   ├── BuildDetailPage.tsx         # Blueprint inspector & material palette
│   ├── BuildGeneratorPage.tsx      # 5-step generator, results tabs, batcher
│   └── AboutPage.tsx               # Philosophy, math engine, safety tips
└── test/
    ├── setup.ts                    # Vitest setup
    ├── coordinateEngine.test.ts    # Translation & rotation tests
    ├── blueprintValidator.test.ts  # Blueprint schema validation tests
    ├── cuboidOptimizer.test.ts     # Cuboid grouping tests
    ├── adapters.test.ts            # Java & Bedrock adapter syntax tests
    ├── datapackExporter.test.ts    # JSZip archive decompression & validation tests
    └── uiComponents.test.tsx       # React component & generator workflow tests
```

---

## 🎮 How to Use Generated Output in Minecraft

### Java Edition (Datapack)
1. Download the generated `blockforge-<slug>-java-datapack.zip`.
2. Place the ZIP into: `%appdata%\.minecraft\saves\<YourWorldName>\datapacks\`.
3. In-game (cheats enabled), type: `/reload`.
4. Run: `/function blockforge:build`.
5. The structure will construct instantly at your selected coordinates.

### Bedrock Edition / Mobile
1. Ensure **Allow Cheats** is enabled in World Settings.
2. From the **Commands** tab in BLOCKFORGE, copy the generated command batch.
3. Paste into in-game chat or into an impulse command block.
4. Because of cuboid optimization, entire buildings require only a few command pastes!

---

## 📄 License & Philosophy

BLOCKFORGE is free and open-source. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
