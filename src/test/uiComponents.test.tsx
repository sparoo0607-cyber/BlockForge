import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BuildCard } from '../components/builds/BuildCard';
import { starterHouseBlueprint } from '../data/blueprints/starterHouse';
import { BuildCatalogPage } from '../pages/BuildCatalogPage';
import { BuildGeneratorPage } from '../pages/BuildGeneratorPage';
import { AboutPage } from '../pages/AboutPage';

// Mock Three.js / WebGL canvas for testing environment since jsdom does not support WebGL
vi.mock('../components/preview/VoxelPreview', () => ({
  VoxelPreview: () => <div data-testid="voxel-preview-mock">3D Preview Mock</div>,
}));

describe('UI Components and Pages', () => {
  describe('BuildCard', () => {
    it('renders structure name, category, and dimensions correctly', () => {
      render(
        <MemoryRouter>
          <BuildCard blueprint={starterHouseBlueprint} />
        </MemoryRouter>
      );

      expect(screen.getByText('Compact Starter House')).toBeInTheDocument();
      expect(screen.getByText('Houses')).toBeInTheDocument();
      expect(screen.getByText(/5×5×5/)).toBeInTheDocument();
      expect(screen.getByText(/blocks/)).toBeInTheDocument();
      expect(screen.getByText('Generate')).toBeInTheDocument();
    });
  });

  describe('BuildCatalogPage', () => {
    it('renders all structures and filters by search query', () => {
      render(
        <MemoryRouter>
          <BuildCatalogPage />
        </MemoryRouter>
      );

      // Verify page title and initial builds
      expect(screen.getByText('Premade Minecraft Builds')).toBeInTheDocument();
      expect(screen.getByText('Compact Starter House')).toBeInTheDocument();
      expect(screen.getByText('Medieval Watchtower')).toBeInTheDocument();

      // Type in search query "Watchtower"
      const searchInput = screen.getByPlaceholderText(/Search by structure name/i);
      fireEvent.change(searchInput, { target: { value: 'Watchtower' } });

      expect(screen.getByText('Medieval Watchtower')).toBeInTheDocument();
      expect(screen.queryByText('Compact Starter House')).not.toBeInTheDocument();
    });

    it('filters by category buttons', () => {
      render(
        <MemoryRouter>
          <BuildCatalogPage />
        </MemoryRouter>
      );

      const castlesBtn = screen.getByRole('button', { name: /Castles/i });
      fireEvent.click(castlesBtn);

      expect(screen.getByText('Small Stone Castle')).toBeInTheDocument();
      expect(screen.queryByText('Compact Starter House')).not.toBeInTheDocument();
    });
  });

  describe('BuildGeneratorPage', () => {
    it('renders coordinate inputs, edition selectors, and generates commands on submit', () => {
      render(
        <MemoryRouter initialEntries={['/generate/compact-starter-house']}>
          <Routes>
            <Route path="/generate/:slug" element={<BuildGeneratorPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify header and fields
      expect(screen.getByRole('heading', { name: /Compact Starter House/i })).toBeInTheDocument();
      const xInput = screen.getByLabelText(/X Coordinate/i) as HTMLInputElement;
      const yInput = screen.getByLabelText(/Y \(Height\)/i) as HTMLInputElement;
      const zInput = screen.getByLabelText(/Z Coordinate/i) as HTMLInputElement;

      expect(xInput).toBeInTheDocument();
      expect(yInput).toBeInTheDocument();
      expect(zInput).toBeInTheDocument();

      // Change coordinates
      fireEvent.change(xInput, { target: { value: '150' } });
      fireEvent.change(yInput, { target: { value: '70' } });
      fireEvent.change(zInput, { target: { value: '-80' } });

      // Click 90° Clockwise
      const rot90Btn = screen.getByText(/90° Clockwise/i);
      fireEvent.click(rot90Btn);

      // Click "Generate Build"
      const generateBtn = screen.getByRole('button', { name: /Generate Build/i });
      fireEvent.click(generateBtn);

      // Verify generation results appeared
      expect(screen.getByText(/Build Generated Successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/Constructing at/i)).toBeInTheDocument();
      expect(screen.getByText(/X=150, Y=70, Z=-80/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Downloadable Files$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^In-Game Instructions$/i })).toBeInTheDocument();
    });
  });

  describe('AboutPage', () => {
    it('renders mission and technical explanation', () => {
      render(
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      );

      expect(screen.getByText('About BLOCKFORGE')).toBeInTheDocument();
      expect(screen.getByText('100% Free Forever')).toBeInTheDocument();
      expect(screen.getByText('Client-Side & Private')).toBeInTheDocument();
      expect(screen.getByText(/Minecraft Java Edition/i)).toBeInTheDocument();
      expect(screen.getByText(/Minecraft Bedrock & Mobile Edition/i)).toBeInTheDocument();
    });
  });
});
