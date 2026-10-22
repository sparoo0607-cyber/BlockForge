import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BuildBlueprint, RotationAngle } from '../../types/blueprint';
import { rotateLocalPosition, getRotatedDimensions } from '../../engine/coordinateEngine';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';

interface VoxelPreviewProps {
  blueprint: BuildBlueprint;
  rotation?: RotationAngle;
  className?: string;
  height?: string | number;
}

const BLOCK_COLORS: Record<string, { color: number; opacity?: number; emissive?: number }> = {
  'minecraft:oak_planks': { color: 0xb88748 },
  'minecraft:oak_log': { color: 0x6b5130 },
  'minecraft:oak_stairs': { color: 0xb88748 },
  'minecraft:oak_slab': { color: 0xb88748 },
  'minecraft:oak_leaves': { color: 0x3b6f22, opacity: 0.9 },
  'minecraft:oak_door': { color: 0x8a6034 },
  'minecraft:cobblestone': { color: 0x6e6e6e },
  'minecraft:stone_bricks': { color: 0x5a5d5a },
  'minecraft:chiseled_stone_bricks': { color: 0x4a4d4a },
  'minecraft:spruce_planks': { color: 0x684e32 },
  'minecraft:spruce_stairs': { color: 0x684e32 },
  'minecraft:spruce_fence': { color: 0x543e26 },
  'minecraft:spruce_door': { color: 0x483420 },
  'minecraft:smooth_quartz': { color: 0xe8e3d9 },
  'minecraft:white_concrete': { color: 0xececee },
  'minecraft:gray_concrete': { color: 0x373a3e },
  'minecraft:glass_pane': { color: 0x88c0d0, opacity: 0.5 },
  'minecraft:iron_bars': { color: 0x90989f },
  'minecraft:lantern': { color: 0xf5b041, emissive: 0xf5b041 },
};

function getMaterialProps(blockName: string) {
  const clean = blockName.includes(':') ? blockName : `minecraft:${blockName}`;
  return BLOCK_COLORS[clean] ?? { color: 0x828282 };
}

export const VoxelPreview: React.FC<VoxelPreviewProps> = ({
  blueprint,
  rotation = 0,
  className = '',
  height = 360,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 16, theta: Math.PI / 4, phi: Math.PI / 3 });

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const renderHeight = typeof height === 'number' ? height : 360;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111511);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / renderHeight, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, renderHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x79d45b, 0.25);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // 5. Grid plane
    const grid = new THREE.GridHelper(20, 20, 0x2a3229, 0x1d231d);
    grid.position.y = -0.51;
    scene.add(grid);

    // 6. Build Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += 0.005;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / renderHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, renderHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [height]);

  // Update Voxels when blueprint or rotation changes
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const rotatedDims = getRotatedDimensions(blueprint.dimensions, rotation);
    const offsetX = (rotatedDims.width - 1) / 2;
    const offsetY = 0;
    const offsetZ = (rotatedDims.depth - 1) / 2;

    // Adjust camera distance based on build size
    const maxDim = Math.max(rotatedDims.width, rotatedDims.height, rotatedDims.depth);
    sphericalRef.current.radius = Math.max(12, maxDim * 2.2);
    updateCameraPosition();

    const boxGeom = new THREE.BoxGeometry(0.96, 0.96, 0.96);

    // Origin marker cube (glowing green wireframe/outline at [0,0,0])
    const originGeom = new THREE.BoxGeometry(1.04, 1.04, 1.04);
    const originMat = new THREE.MeshBasicMaterial({
      color: 0x79d45b,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const originMesh = new THREE.Mesh(originGeom, originMat);
    originMesh.position.set(-offsetX, 0, -offsetZ);
    group.add(originMesh);

    // Cache materials to avoid redundant shader creation
    const materialCache = new Map<string, THREE.Material>();

    for (const b of blueprint.blocks) {
      const rotated = rotateLocalPosition(b.pos, blueprint.dimensions, rotation);
      const [rx, ry, rz] = rotated;

      const matProps = getMaterialProps(b.block);
      const cacheKey = `${b.block}_${matProps.color}_${matProps.opacity ?? 1}`;

      let material = materialCache.get(cacheKey);
      if (!material) {
        material = new THREE.MeshStandardMaterial({
          color: matProps.color,
          roughness: 0.7,
          metalness: 0.1,
          transparent: (matProps.opacity ?? 1) < 1,
          opacity: matProps.opacity ?? 1,
          emissive: matProps.emissive ? matProps.emissive : 0x000000,
          emissiveIntensity: matProps.emissive ? 0.6 : 0,
        });
        materialCache.set(cacheKey, material);
      }

      const voxel = new THREE.Mesh(boxGeom, material);
      voxel.position.set(rx - offsetX, ry - offsetY, rz - offsetZ);
      group.add(voxel);
    }
  }, [blueprint, rotation]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= deltaX * 0.01;
    sphericalRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.01)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(6, Math.min(45, sphericalRef.current.radius + e.deltaY * 0.02));
    updateCameraPosition();
  };

  const resetView = () => {
    sphericalRef.current = {
      radius: Math.max(12, Math.max(blueprint.dimensions.width, blueprint.dimensions.depth) * 2.2),
      theta: Math.PI / 4,
      phi: Math.PI / 3,
    };
    updateCameraPosition();
  };

  const setTopDownView = () => {
    sphericalRef.current.phi = 0.12;
    updateCameraPosition();
  };

  const setIsometricView = () => {
    sphericalRef.current.theta = Math.PI / 4;
    sphericalRef.current.phi = Math.PI / 3.5;
    updateCameraPosition();
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[#2A3229] bg-[#111511] select-none ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#151915]/80 backdrop-blur-md p-1.5 rounded-lg border border-[#2A3229] text-xs text-[#A0A89D]">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded hover:text-white transition-colors ${autoRotate ? 'text-[#79D45B] bg-[#79D45B]/10' : ''}`}
          title="Toggle Auto-Rotate"
          aria-label="Toggle Auto-Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setIsometricView}
          className="p-1.5 rounded hover:text-white transition-colors"
          title="Isometric View"
          aria-label="Isometric View"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setTopDownView}
          className="p-1.5 rounded hover:text-white transition-colors"
          title="Top-Down View"
          aria-label="Top-Down View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            sphericalRef.current.radius = Math.max(6, sphericalRef.current.radius - 2);
            updateCameraPosition();
          }}
          className="p-1.5 rounded hover:text-white transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            sphericalRef.current.radius = Math.min(45, sphericalRef.current.radius + 2);
            updateCameraPosition();
          }}
          className="p-1.5 rounded hover:text-white transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="px-2 py-1 text-[11px] font-medium text-[#F3F5EF] hover:bg-[#2A3229] rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Origin indicator badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#151915]/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#2A3229] text-xs">
        <span className="w-2.5 h-2.5 rounded-sm border border-[#79D45B] bg-[#79D45B]/30 animate-pulse" />
        <span className="text-[#A0A89D]">Local Origin: <span className="font-mono text-[#F3F5EF]">(0, 0, 0)</span></span>
        {rotation > 0 && (
          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-[#2A3229] text-[#79D45B] font-mono">
            {rotation}°
          </span>
        )}
      </div>
    </div>
  );
};
