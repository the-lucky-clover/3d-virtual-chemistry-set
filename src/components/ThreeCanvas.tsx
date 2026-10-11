import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VesselState, SafetyGearState } from '../types';
import { getFlameColorByReagent, getReagentById } from '../lib/chemicalDatabase';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Flame, 
  Waves, 
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface ThreeCanvasProps {
  vessel: VesselState;
  safetyGear: SafetyGearState;
  onVesselClick?: () => void;
  lastAddedReagent?: { id: string; volumeMl: number; timestamp: number } | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  vessel,
  safetyGear,
  onVesselClick,
  lastAddedReagent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic 3D Object Refs for animation loop
  const vesselGroupRef = useRef<THREE.Group | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const meniscusMeshRef = useRef<THREE.Mesh | null>(null);
  const stirBarMeshRef = useRef<THREE.Mesh | null>(null);
  const flameGroupRef = useRef<THREE.Group | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const crucibleGlowLightRef = useRef<THREE.PointLight | null>(null);
  const crucibleMeshRef = useRef<THREE.Mesh | null>(null);
  const thermometerColumnRef = useRef<THREE.Mesh | null>(null);
  
  // Particle Systems
  const bubbleParticlesRef = useRef<THREE.InstancedMesh | null>(null);
  const bubbleCount = 45;
  const bubbleData = useRef<Array<{ x: number; y: number; z: number; speed: number; wobbleSpeed: number; size: number }>>([]);
  
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const steamCount = 35;
  const steamData = useRef<Array<{ x: number; y: number; z: number; vy: number; vx: number; vz: number; life: number; maxLife: number }>>([]);

  const distillateDropsRef = useRef<THREE.Group | null>(null);
  const pouringGroupRef = useRef<THREE.Group | null>(null);
  const pouringAnimRef = useRef<{ active: boolean; progress: number; reagentId: string; volume: number }>({
    active: false,
    progress: 0,
    reagentId: 'h2o',
    volume: 25,
  });

  // Camera Orbit & Interaction State
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.65, 0));
  const cameraAngleRef = useRef({ theta: 0.35, phi: 0.55, radius: 4.6 });
  const targetCameraAngleRef = useRef({ theta: 0.35, phi: 0.55, radius: 4.6 });
  const [activePreset, setActivePreset] = useState<'default' | 'meniscus' | 'burner' | 'top'>('default');

  // Tooltip / Raycasting State
  const [hoverInfo, setHoverInfo] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mousePosRef = useRef(new THREE.Vector2());

  // Listen to Reagent Added trigger for 3D Pouring Animation
  useEffect(() => {
    if (lastAddedReagent && Date.now() - lastAddedReagent.timestamp < 3000) {
      pouringAnimRef.current = {
        active: true,
        progress: 0,
        reagentId: lastAddedReagent.id,
        volume: lastAddedReagent.volumeMl,
      };
    }
  }, [lastAddedReagent]);

  // Helper to create high-resolution graduation line texture on canvas
  const createGraduationTexture = (type: string, capacity: number): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 512);

    // Frosted white labeling patch
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.roundRect ? ctx.roundRect(180, 160, 150, 70, 8) : ctx.fillRect(180, 160, 150, 70);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 4;
    ctx.font = 'bold 24px monospace';

    // Lab logo / brand text
    ctx.textAlign = 'center';
    ctx.fillText('PYREX® BORO 3.3', 256, 195);
    ctx.font = '16px monospace';
    ctx.fillText(`APPROX. VOL. ${capacity}mL`, 256, 218);

    // Graduation lines
    const steps = 5;
    const bottomY = 460;
    const topY = 120;
    const stepHeight = (bottomY - topY) / steps;

    for (let i = 1; i <= steps; i++) {
      const y = bottomY - i * stepHeight;
      const vol = Math.round((capacity / (steps + 1)) * i);

      // Major tick
      ctx.beginPath();
      ctx.moveTo(140, y);
      ctx.lineTo(210, y);
      ctx.stroke();

      // Number
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${vol}`, 130, y + 7);

      // Minor tick between
      if (i < steps) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.moveTo(165, y - stepHeight / 2);
        ctx.lineTo(200, y - stepHeight / 2);
        ctx.stroke();
        ctx.lineWidth = 4;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Main Three.js Scene Initialization
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0F1D');
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. WebGL Renderer with High Fidelity Shadows & Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 4. Studio Laboratory Lighting
    const ambientLight = new THREE.AmbientLight('#E2E8F0', 0.65);
    scene.add(ambientLight);

    // Overhead Daylight Key Light (Cast Shadows)
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.8);
    keyLight.position.set(4, 9, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    // Cyan Fill / Rim Light
    const rimLight = new THREE.DirectionalLight('#38BDF8', 0.9);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Soft Warm Bounce Light from benchtop
    const warmBounce = new THREE.DirectionalLight('#FDE047', 0.3);
    warmBounce.position.set(0, -2, 2);
    scene.add(warmBounce);

    // 5. Dynamic Bunsen & Incandescence Point Lights
    const flameLight = new THREE.PointLight('#38BDF8', 0, 4);
    flameLight.position.set(0, 0.45, 0.8);
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    const crucibleLight = new THREE.PointLight('#F97316', 0, 3);
    crucibleLight.position.set(0, 0.9, 0);
    scene.add(crucibleLight);
    crucibleGlowLightRef.current = crucibleLight;

    // 6. Build Laboratory Workbench & Fume Hood Environment
    createLaboratoryEnvironment(scene);

    // 7. Apparatus Groups
    const vesselGroup = new THREE.Group();
    vesselGroup.position.set(0, 0, 0);
    scene.add(vesselGroup);
    vesselGroupRef.current = vesselGroup;

    // Reagent Pouring Animation Rig
    const pouringGroup = new THREE.Group();
    pouringGroup.position.set(0.9, 1.9, 0);
    pouringGroup.visible = false;
    scene.add(pouringGroup);
    pouringGroupRef.current = pouringGroup;
    buildPouringCylinder(pouringGroup);

    // Distillate Drips Rig
    const distillateGroup = new THREE.Group();
    scene.add(distillateGroup);
    distillateDropsRef.current = distillateGroup;

    // Initialize Bubble Particle InstancedMesh
    initBubbleSystem(scene);

    // Initialize Steam Particle System
    initSteamSystem(scene);

    // Rebuild initial 3D Vessel Model
    rebuildVesselModel(vesselGroup, vessel, safetyGear);

    // 8. Animation & Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth Camera Interpolation (Damping)
      cameraAngleRef.current.theta += (targetCameraAngleRef.current.theta - cameraAngleRef.current.theta) * 0.08;
      cameraAngleRef.current.phi += (targetCameraAngleRef.current.phi - cameraAngleRef.current.phi) * 0.08;
      cameraAngleRef.current.radius += (targetCameraAngleRef.current.radius - cameraAngleRef.current.radius) * 0.08;
      updateCameraPosition();

      // Animate Bunsen Flame & Dynamic Flickering Light
      if (flameGroupRef.current && vessel.isHeating) {
        flameGroupRef.current.visible = true;
        const flicker = Math.sin(elapsedTime * 28) * 0.08 + Math.cos(elapsedTime * 37) * 0.06;
        flameGroupRef.current.scale.set(
          1 + flicker * 0.5,
          1 + flicker * 1.2 + Math.sin(elapsedTime * 18) * 0.06,
          1 + flicker * 0.5
        );
        flameGroupRef.current.rotation.y = elapsedTime * 2.0;

        if (flameLightRef.current) {
          flameLightRef.current.intensity = 2.2 + flicker * 0.8;
          let flameHex = getFlameColorByReagent(vessel.contents[0]?.reagentId || 'h2o');
          flameLightRef.current.color.set(flameHex);
        }
      } else if (flameGroupRef.current) {
        flameGroupRef.current.visible = false;
        if (flameLightRef.current) flameLightRef.current.intensity = 0;
      }

      // Animate Crucible Incandescent Glowing Heat
      if (crucibleMeshRef.current && vessel.type === 'crucible') {
        const mat = crucibleMeshRef.current.material as THREE.MeshStandardMaterial;
        if (vessel.isHeating || vessel.temperatureC > 100) {
          const heatRatio = Math.min(1.0, (vessel.temperatureC - 25) / 300);
          mat.emissive.set(new THREE.Color('#FF4500').multiplyScalar(heatRatio * 0.85));
          if (crucibleGlowLightRef.current) {
            crucibleGlowLightRef.current.intensity = heatRatio * 2.5;
          }
        } else {
          mat.emissive.set('#000000');
          if (crucibleGlowLightRef.current) crucibleGlowLightRef.current.intensity = 0;
        }
      }

      // Animate Magnetic Stir Bar & Liquid Surface Whirlpool
      if (stirBarMeshRef.current && vessel.isStirring) {
        stirBarMeshRef.current.rotation.y += 0.45;
        if (liquidMeshRef.current) {
          liquidMeshRef.current.rotation.y += 0.06;
        }
      } else if (stirBarMeshRef.current) {
        stirBarMeshRef.current.rotation.y = 0.2;
      }

      // Animate Liquid Surface Waves
      if (meniscusMeshRef.current) {
        const stirEffect = vessel.isStirring ? Math.sin(elapsedTime * 12) * 0.03 : 0;
        const boilEffect = vessel.isHeating ? Math.sin(elapsedTime * 18) * 0.02 : 0;
        meniscusMeshRef.current.scale.set(
          1 + Math.sin(elapsedTime * 3) * 0.01 + stirEffect,
          1 + boilEffect,
          1 + Math.cos(elapsedTime * 3) * 0.01 + stirEffect
        );
      }

      // Animate Dynamic Thermometer Liquid Height
      if (thermometerColumnRef.current) {
        const normTemp = Math.min(1, Math.max(0, (vessel.temperatureC - 0) / 150));
        const targetScaleY = 0.15 + normTemp * 0.85;
        thermometerColumnRef.current.scale.y = targetScaleY;
        thermometerColumnRef.current.position.y = 0.5 + targetScaleY * 0.45;
      }

      // Animate Effervescence / Boiling Bubbles
      updateBubbleParticles(elapsedTime, vessel);

      // Animate Steam / Condensation Vapor System
      updateSteamParticles(elapsedTime, vessel);

      // Animate Liebig Distillation Drips
      updateDistillateDrips(elapsedTime, vessel);

      // Animate Reagent Pouring Stream
      updatePouringAnimation(delta);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Rebuild 3D Model when Vessel or Safety State changes
  useEffect(() => {
    if (vesselGroupRef.current) {
      rebuildVesselModel(vesselGroupRef.current, vessel, safetyGear);
    }
  }, [vessel, safetyGear]);

  // Update Camera Orbit Coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = cameraTargetRef.current.y + radius * Math.cos(phi);
    cameraRef.current.position.z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  // Camera View Presets
  const setCameraPreset = (preset: 'default' | 'meniscus' | 'burner' | 'top') => {
    setActivePreset(preset);
    if (preset === 'default') {
      targetCameraAngleRef.current = { theta: 0.35, phi: 0.55, radius: 4.6 };
      cameraTargetRef.current.set(0, 0.65, 0);
    } else if (preset === 'meniscus') {
      targetCameraAngleRef.current = { theta: 0.1, phi: 0.72, radius: 2.2 };
      cameraTargetRef.current.set(0, 0.5, 0);
    } else if (preset === 'burner') {
      targetCameraAngleRef.current = { theta: 0.0, phi: 0.85, radius: 2.8 };
      cameraTargetRef.current.set(0, 0.3, 0);
    } else if (preset === 'top') {
      targetCameraAngleRef.current = { theta: 0.0, phi: 0.12, radius: 3.5 };
      cameraTargetRef.current.set(0, 0.4, 0);
    }
  };

  const handleZoom = (delta: number) => {
    targetCameraAngleRef.current.radius = Math.max(1.8, Math.min(8.0, targetCameraAngleRef.current.radius + delta));
  };

  // Touch & Pointer Drag Rotation Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousPointerRef.current.x;
      const deltaY = e.clientY - previousPointerRef.current.y;

      targetCameraAngleRef.current.theta -= deltaX * 0.007;
      targetCameraAngleRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, targetCameraAngleRef.current.phi - deltaY * 0.007));

      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    }

    // Raycasting for 3D Hover Tooltip
    if (mountRef.current && cameraRef.current && sceneRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mousePosRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
        const objName = intersects[0].object.name;
        if (objName) {
          setHoverInfo({
            title: objName,
            subtitle: `${vessel.temperatureC.toFixed(1)}°C • ${vessel.contents.reduce((a, b) => a + b.volumeMl, 0)}mL`,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          return;
        }
      }
      setHoverInfo(null);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY * 0.003);
  };

  // Environment Construction: Slate Benchtop, Fume Hood Frame, Chemical Tiles
  const createLaboratoryEnvironment = (scene: THREE.Scene) => {
    // 1. Heavy Laboratory Epoxy Resin Bench
    const benchGeo = new THREE.BoxGeometry(7, 0.25, 4.5);
    const benchMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.25,
      metalness: 0.15,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.125, 0);
    bench.receiveShadow = true;
    scene.add(bench);

    // Subtle Benchtop Measurement Grid Pattern
    const gridHelper = new THREE.GridHelper(5, 20, '#38BDF8', '#1E293B');
    gridHelper.position.set(0, 0.005, 0);
    (gridHelper.material as THREE.Material).opacity = 0.25;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // 2. Fume Hood Stainless Steel Back Wall & Draft Louvers
    const backWallGeo = new THREE.BoxGeometry(6.6, 3.8, 0.12);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.6,
      metalness: 0.4,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 1.8, -2.1);
    scene.add(backWall);

    // Fume Hood Air Exhaust Slots
    for (let i = 0; i < 4; i++) {
      const slotGeo = new THREE.BoxGeometry(4.8, 0.06, 0.02);
      const slotMat = new THREE.MeshBasicMaterial({ color: '#090D16' });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(0, 0.8 + i * 0.45, -2.03);
      scene.add(slot);
    }

    // 3. Fume Hood Glass Sash Frame
    const sashGeo = new THREE.BoxGeometry(6.2, 1.4, 0.04);
    const sashMat = new THREE.MeshPhysicalMaterial({
      color: '#0284C7',
      transparent: true,
      opacity: 0.2,
      roughness: 0.05,
      transmission: 0.95,
      ior: 1.48,
    });
    const sash = new THREE.Mesh(sashGeo, sashMat);
    sash.position.set(0, 2.5, -1.95);
    scene.add(sash);

    // Fume Hood Warning Vinyl Decal
    const decalGeo = new THREE.PlaneGeometry(1.2, 0.3);
    const decalCanvas = document.createElement('canvas');
    decalCanvas.width = 256;
    decalCanvas.height = 64;
    const dctx = decalCanvas.getContext('2d')!;
    dctx.fillStyle = '#EAB308';
    dctx.fillRect(0, 0, 256, 64);
    dctx.fillStyle = '#000000';
    dctx.font = 'bold 24px monospace';
    dctx.textAlign = 'center';
    dctx.fillText('▲ FUME HOOD ON ▲', 128, 42);
    const decalTex = new THREE.CanvasTexture(decalCanvas);
    const decalMat = new THREE.MeshBasicMaterial({ map: decalTex });
    const decalMesh = new THREE.Mesh(decalGeo, decalMat);
    decalMesh.position.set(-2.0, 3.1, -1.92);
    scene.add(decalMesh);
  };

  // Reagent Pouring Cylinder Rig
  const buildPouringCylinder = (group: THREE.Group) => {
    while (group.children.length > 0) group.remove(group.children[0]);

    const cylMat = new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.45,
      transmission: 0.9,
      roughness: 0.1,
    });

    const cylGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
    const cylMesh = new THREE.Mesh(cylGeo, cylMat);
    group.add(cylMesh);

    // Liquid in Cylinder
    const liqGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.5, 16);
    const liqMat = new THREE.MeshStandardMaterial({ color: '#38BDF8', transparent: true, opacity: 0.85 });
    const liqMesh = new THREE.Mesh(liqGeo, liqMat);
    liqMesh.position.y = -0.15;
    group.add(liqMesh);

    // Pouring Stream Line
    const streamGeo = new THREE.CylinderGeometry(0.02, 0.03, 1.2, 8);
    const streamMat = new THREE.MeshStandardMaterial({ color: '#38BDF8', transparent: true, opacity: 0.9 });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.position.set(-0.4, -0.7, 0);
    streamMesh.rotation.z = -Math.PI / 4;
    streamMesh.name = 'pouringStream';
    streamMesh.visible = false;
    group.add(streamMesh);
  };

  // Particle System 1: Bubble / Effervescence InstancedMesh
  const initBubbleSystem = (scene: THREE.Scene) => {
    const bubbleGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.65,
      transmission: 0.9,
      roughness: 0.1,
      ior: 1.1,
    });

    const instancedMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);
    bubbleParticlesRef.current = instancedMesh;

    bubbleData.current = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < bubbleCount; i++) {
      const b = {
        x: (Math.random() - 0.5) * 0.45,
        y: Math.random() * 0.8 + 0.1,
        z: (Math.random() - 0.5) * 0.45,
        speed: 0.015 + Math.random() * 0.025,
        wobbleSpeed: 4 + Math.random() * 6,
        size: 0.5 + Math.random() * 0.8,
      };
      bubbleData.current.push(b);
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.size, b.size, b.size);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
  };

  // Particle System 2: Steam / Condensation Vapor System
  const initSteamSystem = (scene: THREE.Scene) => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(steamCount * 3);
    const opacities = new Float32Array(steamCount);

    steamData.current = [];
    for (let i = 0; i < steamCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = 0.8 + Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      opacities[i] = Math.random() * 0.4;

      steamData.current.push({
        x: (Math.random() - 0.5) * 0.25,
        y: 0.8 + Math.random() * 1.2,
        z: (Math.random() - 0.5) * 0.25,
        vx: (Math.random() - 0.5) * 0.005,
        vy: 0.01 + Math.random() * 0.015,
        vz: (Math.random() - 0.5) * 0.005,
        life: Math.random() * 60,
        maxLife: 60 + Math.random() * 40,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.3)');
    grad.addColorStop(1, 'rgba(240, 249, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      size: 0.25,
      map: texture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    steamParticlesRef.current = points;
  };

  // Update Bubbles on each frame
  const updateBubbleParticles = (time: number, v: VesselState) => {
    if (!bubbleParticlesRef.current) return;
    const activeRate = (v.bubblesRate || 0) + (v.isHeating ? 3 : 0);

    if (activeRate <= 0 || v.contents.length === 0) {
      bubbleParticlesRef.current.visible = false;
      return;
    }

    bubbleParticlesRef.current.visible = true;
    const dummy = new THREE.Object3D();
    const totalVol = v.contents.reduce((a, b) => a + b.volumeMl, 0);
    const fillH = Math.min(1.0, totalVol / v.capacityMl);

    bubbleData.current.forEach((b, i) => {
      b.y += b.speed * (activeRate * 0.4);
      b.x += Math.sin(time * b.wobbleSpeed + i) * 0.003;
      b.z += Math.cos(time * b.wobbleSpeed + i) * 0.003;

      if (b.y > fillH + 0.1) {
        b.y = 0.05;
        b.x = (Math.random() - 0.5) * 0.4;
        b.z = (Math.random() - 0.5) * 0.4;
      }

      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.size, b.size, b.size);
      dummy.updateMatrix();
      bubbleParticlesRef.current!.setMatrixAt(i, dummy.matrix);
    });

    bubbleParticlesRef.current.instanceMatrix.needsUpdate = true;
  };

  // Update Steam on each frame
  const updateSteamParticles = (time: number, v: VesselState) => {
    if (!steamParticlesRef.current) return;

    if (v.temperatureC < 55 && !v.isHeating) {
      steamParticlesRef.current.visible = false;
      return;
    }

    steamParticlesRef.current.visible = true;
    const posAttr = steamParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const heatFactor = Math.max(1, (v.temperatureC - 45) / 20);

    steamData.current.forEach((p, i) => {
      p.life += 1;
      p.y += p.vy * heatFactor;
      p.x += p.vx + Math.sin(time * 2 + i) * 0.002;
      p.z += p.vz + Math.cos(time * 2 + i) * 0.002;

      if (p.life > p.maxLife || p.y > 2.8) {
        p.life = 0;
        p.x = (Math.random() - 0.5) * 0.25;
        p.y = 0.8 + (v.contents.length > 0 ? 0.3 : 0);
        p.z = (Math.random() - 0.5) * 0.25;
      }

      posArray[i * 3] = p.x;
      posArray[i * 3 + 1] = p.y;
      posArray[i * 3 + 2] = p.z;
    });

    posAttr.needsUpdate = true;
  };

  // Update Distillate Condensation Drips in Liebig Condenser
  const updateDistillateDrips = (time: number, v: VesselState) => {
    if (!distillateDropsRef.current || v.type !== 'liebigCondenser') return;

    if (v.isHeating && v.temperatureC > 70) {
      distillateDropsRef.current.visible = true;
      // Drip animation along slanted condenser tube
      distillateDropsRef.current.children.forEach((drop, idx) => {
        const progress = ((time * 0.8 + idx * 0.35) % 1.0);
        // Start at boiling neck (-0.3, 1.3, 0) and end at receiver (1.3, 0.4, 0)
        drop.position.x = -0.2 + progress * 1.5;
        drop.position.y = 1.35 - progress * 0.9;
        drop.position.z = 0;
        drop.scale.setScalar(Math.sin(progress * Math.PI) * 1.2);
      });
    } else {
      distillateDropsRef.current.visible = false;
    }
  };

  // Update Pouring Reagent Swoop & Stream Animation
  const updatePouringAnimation = (delta: number) => {
    if (!pouringGroupRef.current || !pouringAnimRef.current.active) return;

    pouringAnimRef.current.progress += delta * 1.2;
    const p = pouringAnimRef.current.progress;

    const streamMesh = pouringGroupRef.current.getObjectByName('pouringStream');

    if (p < 0.3) {
      // Swoop in & Tilt
      pouringGroupRef.current.visible = true;
      const t = p / 0.3;
      pouringGroupRef.current.position.set(0.9 - t * 0.4, 1.8 - t * 0.3, 0);
      pouringGroupRef.current.rotation.z = -t * (Math.PI / 3);
      if (streamMesh) streamMesh.visible = false;
    } else if (p < 0.75) {
      // Pouring Stream Active
      pouringGroupRef.current.position.set(0.5, 1.5, 0);
      pouringGroupRef.current.rotation.z = -Math.PI / 3;
      if (streamMesh) streamMesh.visible = true;
    } else if (p < 1.0) {
      // Retract Cylinder
      const t = (p - 0.75) / 0.25;
      pouringGroupRef.current.position.set(0.5 + t * 0.5, 1.5 + t * 0.5, 0);
      pouringGroupRef.current.rotation.z = -(1 - t) * (Math.PI / 3);
      if (streamMesh) streamMesh.visible = false;
    } else {
      // Done
      pouringAnimRef.current.active = false;
      pouringGroupRef.current.visible = false;
    }
  };

  // High-Fidelity Procedural Construction for All Glassware & Apparatus Models
  const rebuildVesselModel = (group: THREE.Group, v: VesselState, safety: SafetyGearState) => {
    // Clear previous children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // High Specular Borosilicate Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#F8FAFC',
      transparent: true,
      opacity: 0.3,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.94,
      thickness: 0.6,
      ior: 1.52, // Accurate borosilicate glass refractive index
      specularColor: new THREE.Color('#FFFFFF'),
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const totalVolume = v.contents.reduce((acc, item) => acc + item.volumeMl, 0);
    const fillFraction = Math.min(0.95, totalVolume / v.capacityMl);

    // Compute Blended Liquid Color
    let liquidColorHex = '#38BDF8';
    if (v.contents.length > 0) {
      if (v.contents.some((c) => c.reagentId === 'phenolphthalein') && v.temperatureC > 15) {
        liquidColorHex = v.contents.some((c) => c.reagentId === 'naoh') ? '#F43F5E' : '#F1F5F9';
      } else if (v.contents.some((c) => c.reagentId === 'universal_ind')) {
        liquidColorHex = '#10B981';
      } else if (v.contents.some((c) => c.reagentId === 'cuso4')) {
        liquidColorHex = '#0284C7';
      } else if (v.contents.some((c) => c.reagentId === 'tea_extract')) {
        liquidColorHex = '#78350F';
      } else if (v.contents.some((c) => c.reagentId === 'ki')) {
        liquidColorHex = '#FACC15';
      } else if (v.contents.some((c) => c.reagentId === 'ch3cooh')) {
        liquidColorHex = '#FEF08A';
      } else {
        const topReagent = getReagentById(v.contents[0].reagentId);
        if (topReagent) liquidColorHex = topReagent.colorHex;
      }
    }

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: liquidColorHex,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15,
      transmission: 0.35,
      ior: 1.333, // Water refractive index
    });

    // 1. BEAKER (250mL / 500mL)
    if (v.type === 'beaker') {
      const beakerGroup = new THREE.Group();
      beakerGroup.name = '250mL Borosilicate Beaker';

      // Cylindrical Glass Body
      const beakerGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.25, 36, 1, true);
      const beakerMesh = new THREE.Mesh(beakerGeo, glassMaterial);
      beakerMesh.position.y = 0.625;
      beakerMesh.name = 'Beaker Wall';
      beakerGroup.add(beakerMesh);

      // Glass Bottom Disc
      const bottomGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.04, 36);
      const bottomMesh = new THREE.Mesh(bottomGeo, glassMaterial);
      bottomMesh.position.y = 0.02;
      beakerGroup.add(bottomMesh);

      // Flared Rim Lip & Pouring Spout
      const rimGeo = new THREE.TorusGeometry(0.62, 0.03, 16, 36);
      const rimMesh = new THREE.Mesh(rimGeo, glassMaterial);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1.25;
      beakerGroup.add(rimMesh);

      // Graduation Scale Overlay
      const gradTexture = createGraduationTexture('beaker', v.capacityMl);
      const gradMat = new THREE.MeshBasicMaterial({
        map: gradTexture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const gradGeo = new THREE.CylinderGeometry(0.625, 0.625, 1.25, 36, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
      const gradMesh = new THREE.Mesh(gradGeo, gradMat);
      gradMesh.position.y = 0.625;
      beakerGroup.add(gradMesh);

      // Magnetic Stir Plate Base underneath
      buildMagneticStirPlate(beakerGroup, v.isStirring);

      // Liquid Fill
      if (fillFraction > 0.01) {
        const liquidHeight = 1.18 * fillFraction;
        const liquidGeo = new THREE.CylinderGeometry(0.6, 0.6, liquidHeight, 36);
        const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
        liquidMesh.position.y = liquidHeight / 2 + 0.02;
        liquidMesh.name = 'Reagent Solution';
        beakerGroup.add(liquidMesh);
        liquidMeshRef.current = liquidMesh;

        // Curved Meniscus Surface
        const meniscusGeo = new THREE.CircleGeometry(0.59, 36);
        const meniscusMat = new THREE.MeshStandardMaterial({
          color: liquidColorHex,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.92,
        });
        const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
        meniscusMesh.rotation.x = -Math.PI / 2;
        meniscusMesh.position.y = liquidHeight + 0.02;
        beakerGroup.add(meniscusMesh);
        meniscusMeshRef.current = meniscusMesh;

        // Magnetic Stir Bar ("Flea")
        buildMagneticStirBar(beakerGroup);
      }

      // Immersion Laboratory Thermometer
      buildImmersionThermometer(beakerGroup, v.temperatureC);

      group.add(beakerGroup);
    } 
    // 2. ERLENMEYER FLASK (500mL)
    else if (v.type === 'erlenmeyer') {
      const flaskGroup = new THREE.Group();
      flaskGroup.name = '500mL Erlenmeyer Flask';

      // Conical Body
      const coneGeo = new THREE.CylinderGeometry(0.28, 0.85, 1.15, 36, 1, true);
      const coneMesh = new THREE.Mesh(coneGeo, glassMaterial);
      coneMesh.position.y = 0.575;
      flaskGroup.add(coneMesh);

      // Neck Tube
      const neckGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 36, 1, true);
      const neckMesh = new THREE.Mesh(neckGeo, glassMaterial);
      neckMesh.position.y = 1.375;
      flaskGroup.add(neckMesh);

      // Flared Neck Rim Bead
      const rimGeo = new THREE.TorusGeometry(0.28, 0.025, 16, 36);
      const rimMesh = new THREE.Mesh(rimGeo, glassMaterial);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1.6;
      flaskGroup.add(rimMesh);

      // Flask Base
      const baseGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.04, 36);
      const baseMesh = new THREE.Mesh(baseGeo, glassMaterial);
      baseMesh.position.y = 0.02;
      flaskGroup.add(baseMesh);

      // Graduation Scale Overlay
      const gradTexture = createGraduationTexture('erlenmeyer', v.capacityMl);
      const gradMat = new THREE.MeshBasicMaterial({ map: gradTexture, transparent: true, opacity: 0.9 });
      const gradGeo = new THREE.CylinderGeometry(0.29, 0.86, 1.15, 36, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
      const gradMesh = new THREE.Mesh(gradGeo, gradMat);
      gradMesh.position.y = 0.575;
      flaskGroup.add(gradMesh);

      // Stir Plate Base
      buildMagneticStirPlate(flaskGroup, v.isStirring);

      if (fillFraction > 0.01) {
        const liquidHeight = 1.1 * fillFraction;
        const topR = 0.28 + (0.85 - 0.28) * (1 - fillFraction);
        const liquidGeo = new THREE.CylinderGeometry(topR, 0.83, liquidHeight, 36);
        const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
        liquidMesh.position.y = liquidHeight / 2 + 0.02;
        flaskGroup.add(liquidMesh);
        liquidMeshRef.current = liquidMesh;

        // Meniscus Surface
        const meniscusGeo = new THREE.CircleGeometry(topR - 0.01, 36);
        const meniscusMat = new THREE.MeshStandardMaterial({ color: liquidColorHex, transparent: true, opacity: 0.9 });
        const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
        meniscusMesh.rotation.x = -Math.PI / 2;
        meniscusMesh.position.y = liquidHeight + 0.02;
        flaskGroup.add(meniscusMesh);
        meniscusMeshRef.current = meniscusMesh;

        buildMagneticStirBar(flaskGroup);
      }

      buildImmersionThermometer(flaskGroup, v.temperatureC);
      group.add(flaskGroup);
    }
    // 3. SEPARATORY FUNNEL (300mL with Retort Ring Stand & Immiscible Layers)
    else if (v.type === 'sepFunnel') {
      const sepGroup = new THREE.Group();
      sepGroup.name = 'Separatory Funnel with Ring Stand';

      // Pear Shaped Glass Bulb
      const pearGeo = new THREE.SphereGeometry(0.72, 36, 36);
      const pearMesh = new THREE.Mesh(pearGeo, glassMaterial);
      pearMesh.scale.set(0.85, 1.35, 0.85);
      pearMesh.position.y = 1.45;
      sepGroup.add(pearMesh);

      // Top Ground Glass Neck & Glass Stopper
      const neckGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 24);
      const neckMesh = new THREE.Mesh(neckGeo, glassMaterial);
      neckMesh.position.y = 2.45;
      sepGroup.add(neckMesh);

      const stopperGeo = new THREE.CylinderGeometry(0.22, 0.15, 0.25, 24);
      const stopperMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.4 });
      const stopperMesh = new THREE.Mesh(stopperGeo, stopperMat);
      stopperMesh.position.y = 2.65;
      sepGroup.add(stopperMesh);

      // Bottom Stem & Teflon Stopcock Valve
      const stemGeo = new THREE.CylinderGeometry(0.09, 0.06, 0.9, 24);
      const stemMesh = new THREE.Mesh(stemGeo, glassMaterial);
      stemMesh.position.y = 0.55;
      sepGroup.add(stemMesh);

      // Teflon Blue Stopcock Plug & Handle
      const stopcockGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 16);
      const teflonMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.3 });
      const stopcockMesh = new THREE.Mesh(stopcockGeo, teflonMat);
      stopcockMesh.rotation.z = Math.PI / 2;
      stopcockMesh.position.set(0, 0.65, 0);
      sepGroup.add(stopcockMesh);

      // Heavy Cast Iron Retort Ring Stand
      buildRetortRingStand(sepGroup);

      // Dual Immiscible Liquid Layers (Ethyl Acetate Organic Layer on top of Aqueous Layer)
      const hasOrganicSolvent = v.contents.some((c) => c.reagentId === 'ethyl_acetate');
      if (hasOrganicSolvent) {
        // Upper Organic Layer (Clear / Translucent Floating)
        const orgGeo = new THREE.SphereGeometry(0.68, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2.2);
        const orgMat = new THREE.MeshPhysicalMaterial({
          color: '#FAF5FF',
          transparent: true,
          opacity: 0.6,
          roughness: 0.1,
          transmission: 0.9,
        });
        const orgMesh = new THREE.Mesh(orgGeo, orgMat);
        orgMesh.scale.set(0.82, 1.25, 0.82);
        orgMesh.position.y = 1.48;
        sepGroup.add(orgMesh);

        // Lower Aqueous Botanical Layer
        const aqGeo = new THREE.SphereGeometry(0.68, 36, 18, 0, Math.PI * 2, Math.PI / 2.2, Math.PI / 2);
        const aqMesh = new THREE.Mesh(aqGeo, liquidMat);
        aqMesh.scale.set(0.82, 1.25, 0.82);
        aqMesh.position.y = 1.45;
        sepGroup.add(aqMesh);

        // Visible Refractive Interfacial Meniscus Disc
        const discGeo = new THREE.CircleGeometry(0.55, 36);
        const discMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.4 });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.rotation.x = -Math.PI / 2;
        discMesh.position.y = 1.46;
        sepGroup.add(discMesh);
      } else if (fillFraction > 0.01) {
        const aqGeo = new THREE.SphereGeometry(0.68, 36, 36);
        const aqMesh = new THREE.Mesh(aqGeo, liquidMat);
        aqMesh.scale.set(0.82, 1.25 * fillFraction, 0.82);
        aqMesh.position.y = 1.35;
        sepGroup.add(aqMesh);
        liquidMeshRef.current = aqMesh;
      }

      group.add(sepGroup);
    }
    // 4. LIEBIG CONDENSER DISTILLATION APPARATUS
    else if (v.type === 'liebigCondenser') {
      const distillGroup = new THREE.Group();
      distillGroup.name = 'Liebig Condenser Distillation Train';

      // 1. Round Bottom Boiling Flask on Tripod (Left)
      const boilingFlaskGeo = new THREE.SphereGeometry(0.55, 36, 36);
      const boilingFlask = new THREE.Mesh(boilingFlaskGeo, glassMaterial);
      boilingFlask.position.set(-0.65, 0.85, 0);
      distillGroup.add(boilingFlask);

      // Flask Neck
      const bNeckGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 24);
      const bNeckMesh = new THREE.Mesh(bNeckGeo, glassMaterial);
      bNeckMesh.position.set(-0.65, 1.4, 0);
      distillGroup.add(bNeckMesh);

      // Stillhead 3-Way Distillation Adapter
      const stillheadGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 16);
      const stillhead = new THREE.Mesh(stillheadGeo, glassMaterial);
      stillhead.position.set(-0.65, 1.7, 0);
      distillGroup.add(stillhead);

      // Vertical Distillation Thermometer in Stillhead
      const thermGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.6, 12);
      const thermMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.2 });
      const thermMesh = new THREE.Mesh(thermGeo, thermMat);
      thermMesh.position.set(-0.65, 1.85, 0);
      distillGroup.add(thermMesh);

      // 2. Slanted Liebig Condenser (Inner Vapor Tube)
      const innerTubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 24);
      const innerMesh = new THREE.Mesh(innerTubeGeo, glassMaterial);
      innerMesh.rotation.z = Math.PI / 4.2;
      innerMesh.position.set(0.35, 1.25, 0);
      distillGroup.add(innerMesh);

      // Outer Cooling Water Jacket (Translucent Blue Cooling Water)
      const jacketGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.6, 24);
      const jacketMat = new THREE.MeshPhysicalMaterial({
        color: '#38BDF8',
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        transmission: 0.85,
      });
      const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
      jacketMesh.rotation.z = Math.PI / 4.2;
      jacketMesh.position.set(0.35, 1.25, 0);
      distillGroup.add(jacketMesh);

      // Water Inlet & Outlet Hose Nipples
      const hoseMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.4 });
      const nipple1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), hoseMat);
      nipple1.position.set(0.85, 0.75, 0.2);
      nipple1.rotation.x = Math.PI / 3;
      distillGroup.add(nipple1);

      const nipple2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), hoseMat);
      nipple2.position.set(-0.15, 1.7, 0.2);
      nipple2.rotation.x = Math.PI / 3;
      distillGroup.add(nipple2);

      // 3. Bent Vacuum Receiving Adapter & Receiving Erlenmeyer Flask (Right)
      const bendGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 16);
      const bendMesh = new THREE.Mesh(bendGeo, glassMaterial);
      bendMesh.position.set(1.3, 0.55, 0);
      bendMesh.rotation.z = -Math.PI / 6;
      distillGroup.add(bendMesh);

      const receiveFlaskGeo = new THREE.CylinderGeometry(0.18, 0.48, 0.7, 24);
      const receiveFlask = new THREE.Mesh(receiveFlaskGeo, glassMaterial);
      receiveFlask.position.set(1.4, 0.35, 0);
      distillGroup.add(receiveFlask);

      // Distillate Collected in Receiver
      const distLiquidGeo = new THREE.CylinderGeometry(0.35, 0.46, 0.25, 24);
      const distLiquidMat = new THREE.MeshStandardMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.85 });
      const distLiquidMesh = new THREE.Mesh(distLiquidGeo, distLiquidMat);
      distLiquidMesh.position.set(1.4, 0.15, 0);
      distillGroup.add(distLiquidMesh);

      // Liquid in Boiling Flask
      if (fillFraction > 0.01) {
        const boilLiqGeo = new THREE.SphereGeometry(0.53, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const boilLiqMesh = new THREE.Mesh(boilLiqGeo, liquidMat);
        boilLiqMesh.position.set(-0.65, 0.85, 0);
        distillGroup.add(boilLiqMesh);
        liquidMeshRef.current = boilLiqMesh;
      }

      // Distillate Drip Drop Particles along Condenser
      if (distillateDropsRef.current) {
        while (distillateDropsRef.current.children.length > 0) {
          distillateDropsRef.current.remove(distillateDropsRef.current.children[0]);
        }
        for (let i = 0; i < 4; i++) {
          const dropGeo = new THREE.SphereGeometry(0.035, 12, 12);
          const dropMat = new THREE.MeshBasicMaterial({ color: '#BAE6FD', transparent: true, opacity: 0.9 });
          const dropMesh = new THREE.Mesh(dropGeo, dropMat);
          distillateDropsRef.current.add(dropMesh);
        }
      }

      group.add(distillGroup);
    }
    // 5. PORCELAIN CRUCIBLE (100mL with Tripod & Clay Triangle)
    else if (v.type === 'crucible') {
      const crucibleGroup = new THREE.Group();
      crucibleGroup.name = 'Porcelain Crucible & Clay Triangle';

      // White Glazed Porcelain Material
      const porcelainMat = new THREE.MeshStandardMaterial({
        color: '#F8FAFC',
        roughness: 0.35,
        metalness: 0.05,
      });

      // Crucible Body (Tapered Bowl)
      const crucibleGeo = new THREE.CylinderGeometry(0.42, 0.25, 0.65, 32);
      const crucibleMesh = new THREE.Mesh(crucibleGeo, porcelainMat);
      crucibleMesh.position.y = 0.95;
      crucibleGroup.add(crucibleMesh);
      crucibleMeshRef.current = crucibleMesh;

      // Removable Crucible Lid with Handle
      const lidGeo = new THREE.CylinderGeometry(0.45, 0.44, 0.08, 32);
      const lidMesh = new THREE.Mesh(lidGeo, porcelainMat);
      lidMesh.position.y = 1.32;
      crucibleGroup.add(lidMesh);

      const lidHandleGeo = new THREE.TorusGeometry(0.08, 0.02, 12, 24);
      const lidHandle = new THREE.Mesh(lidHandleGeo, porcelainMat);
      lidHandle.position.y = 1.4;
      crucibleGroup.add(lidHandle);

      // Ceramic Clay Pipe Triangle (Triangular wire frame with ceramic sleeves)
      buildClayTriangle(crucibleGroup);

      // Heavy Metal Cast Iron Tripod
      buildLaboratoryTripod(crucibleGroup);

      // Powder / Mineral Salt in Crucible
      if (v.contents.length > 0) {
        const saltGeo = new THREE.CylinderGeometry(0.38, 0.24, 0.3, 32);
        const saltMat = new THREE.MeshStandardMaterial({ color: liquidColorHex, roughness: 0.8 });
        const saltMesh = new THREE.Mesh(saltGeo, saltMat);
        saltMesh.position.y = 0.85;
        crucibleGroup.add(saltMesh);
      }

      group.add(crucibleGroup);
    }
    // 6. TEST TUBE & WOODEN TEST TUBE RACK
    else {
      const tubeGroup = new THREE.Group();
      tubeGroup.name = 'Borosilicate Test Tube in Rack';

      // Test Tube Glass Body
      const tubeGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 24, 1, true);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMaterial);
      tubeMesh.position.set(0, 0.9, 0);
      tubeGroup.add(tubeMesh);

      // Hemispherical Curved Test Tube Bottom
      const bottomGeo = new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const bottomMesh = new THREE.Mesh(bottomGeo, glassMaterial);
      bottomMesh.position.set(0, 0.2, 0);
      tubeGroup.add(bottomMesh);

      // Flared Rim
      const rimGeo = new THREE.TorusGeometry(0.18, 0.02, 12, 24);
      const rimMesh = new THREE.Mesh(rimGeo, glassMaterial);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.set(0, 1.6, 0);
      tubeGroup.add(rimMesh);

      // Test Tube Rack
      buildTestTubeRack(tubeGroup);

      // Liquid Fill
      if (fillFraction > 0.01) {
        const liquidHeight = 1.2 * fillFraction;
        const liquidGeo = new THREE.CylinderGeometry(0.165, 0.165, liquidHeight, 24);
        const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
        liquidMesh.position.set(0, 0.2 + liquidHeight / 2, 0);
        tubeGroup.add(liquidMesh);
        liquidMeshRef.current = liquidMesh;

        // Curved Hemispherical Liquid Bottom
        const liqBotGeo = new THREE.SphereGeometry(0.165, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const liqBotMesh = new THREE.Mesh(liqBotGeo, liquidMat);
        liqBotMesh.position.set(0, 0.2, 0);
        tubeGroup.add(liqBotMesh);

        // Meniscus Surface
        const meniscusGeo = new THREE.CircleGeometry(0.16, 24);
        const meniscusMat = new THREE.MeshStandardMaterial({ color: liquidColorHex, transparent: true, opacity: 0.9 });
        const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
        meniscusMesh.rotation.x = -Math.PI / 2;
        meniscusMesh.position.set(0, 0.2 + liquidHeight, 0);
        tubeGroup.add(meniscusMesh);
        meniscusMeshRef.current = meniscusMesh;
      }

      group.add(tubeGroup);
    }

    // 7. BUNSEN BURNER & MULTI-ZONE FLAME
    buildBunsenBurnerApparatus(group, v);

    // 8. Crucible Tongs Accessory if Active in PPE
    if (safety.tongsHeld) {
      buildCrucibleTongs(group);
    }
  };

  // Magnetic Stirrer Unit Base
  const buildMagneticStirPlate = (group: THREE.Group, isStirring: boolean) => {
    const stirPlate = new THREE.Group();
    stirPlate.position.set(0, -0.01, 0);

    // Ceramic White Top Plate
    const topGeo = new THREE.BoxGeometry(1.6, 0.06, 1.6);
    const topMat = new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.2, metalness: 0.1 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = -0.03;
    topMesh.receiveShadow = true;
    stirPlate.add(topMesh);

    // Dark Polymer Stirrer Housing
    const bodyGeo = new THREE.BoxGeometry(1.7, 0.35, 1.9);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.3 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, -0.22, 0.1);
    bodyMesh.receiveShadow = true;
    stirPlate.add(bodyMesh);

    // Speed & Temp Knobs
    const knobMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.3 });
    const knob1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), knobMat);
    knob1.rotation.x = Math.PI / 2;
    knob1.position.set(-0.4, -0.22, 1.06);
    stirPlate.add(knob1);

    const knob2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), knobMat);
    knob2.rotation.x = Math.PI / 2;
    knob2.position.set(0.4, -0.22, 1.06);
    stirPlate.add(knob2);

    // Green Active LED
    const ledMat = new THREE.MeshBasicMaterial({ color: isStirring ? '#22C55E' : '#475569' });
    const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), ledMat);
    ledMesh.position.set(0, -0.15, 1.06);
    stirPlate.add(ledMesh);

    group.add(stirPlate);
  };

  // Magnetic Stir Bar ("Flea")
  const buildMagneticStirBar = (group: THREE.Group) => {
    const stirBarGeo = new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.035, 0.22, 8, 16) : new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16);
    const stirBarMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.1 });
    const stirBar = new THREE.Mesh(stirBarGeo, stirBarMat);
    stirBar.rotation.z = Math.PI / 2;
    stirBar.position.set(0, 0.04, 0);
    stirBar.name = 'PTFE Magnetic Stir Bar';
    group.add(stirBar);
    stirBarMeshRef.current = stirBar;
  };

  // Immersion Lab Thermometer
  const buildImmersionThermometer = (group: THREE.Group, tempC: number) => {
    const thermGroup = new THREE.Group();
    thermGroup.position.set(0.38, 0, 0.15);
    thermGroup.rotation.z = -0.12;

    // Glass Stem
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.35, 16);
    const stemMat = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.5, transmission: 0.9 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.85;
    thermGroup.add(stem);

    // Red Kerosene / Alcohol Bulb at Bottom
    const bulbGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: '#EF4444' });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = 0.18;
    thermGroup.add(bulb);

    // Dynamic Red Column
    const columnGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8);
    const column = new THREE.Mesh(columnGeo, bulbMat);
    column.position.y = 0.65;
    thermGroup.add(column);
    thermometerColumnRef.current = column;

    group.add(thermGroup);
  };

  // Retort Ring Stand
  const buildRetortRingStand = (group: THREE.Group) => {
    const metalMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.85, roughness: 0.25 });

    // Heavy Rectangular Base
    const baseGeo = new THREE.BoxGeometry(1.6, 0.08, 1.2);
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.set(-0.7, 0.04, 0);
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Steel Vertical Rod
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.9, 16);
    const rodMesh = new THREE.Mesh(rodGeo, metalMat);
    rodMesh.position.set(-1.2, 1.45, 0);
    rodMesh.castShadow = true;
    group.add(rodMesh);

    // Clamp Bosshead & Ring
    const ringGeo = new THREE.TorusGeometry(0.62, 0.03, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, metalMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, 1.45, 0);
    group.add(ringMesh);

    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 12);
    const armMesh = new THREE.Mesh(armGeo, metalMat);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.set(-0.6, 1.45, 0);
    group.add(armMesh);
  };

  // Wooden / Acrylic Test Tube Rack
  const buildTestTubeRack = (group: THREE.Group) => {
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.7 });

    // Top Plate with Holes
    const topPlateGeo = new THREE.BoxGeometry(1.4, 0.04, 0.6);
    const topPlate = new THREE.Mesh(topPlateGeo, woodMat);
    topPlate.position.set(0, 0.95, 0);
    group.add(topPlate);

    // Bottom Base Plate
    const botPlateGeo = new THREE.BoxGeometry(1.4, 0.06, 0.6);
    const botPlate = new THREE.Mesh(botPlateGeo, woodMat);
    botPlate.position.set(0, 0.03, 0);
    group.add(botPlate);

    // Side Support Pillars
    const pillarGeo = new THREE.BoxGeometry(0.08, 0.95, 0.55);
    const p1 = new THREE.Mesh(pillarGeo, woodMat);
    p1.position.set(-0.65, 0.5, 0);
    group.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, woodMat);
    p2.position.set(0.65, 0.5, 0);
    group.add(p2);
  };

  // Laboratory Tripod
  const buildLaboratoryTripod = (group: THREE.Group) => {
    const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });

    // Top Triangle Ring
    const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, metalMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, 0.65, 0);
    group.add(ringMesh);

    // 3 Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12);
      const legMesh = new THREE.Mesh(legGeo, metalMat);
      legMesh.position.set(Math.cos(angle) * 0.48, 0.32, Math.sin(angle) * 0.48);
      legMesh.rotation.z = Math.sin(angle) * 0.15;
      legMesh.rotation.x = -Math.cos(angle) * 0.15;
      group.add(legMesh);
    }
  };

  // Ceramic Clay Pipe Triangle
  const buildClayTriangle = (group: THREE.Group) => {
    const pipeMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.6 });
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 + Math.PI / 6;
      const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.55, 16);
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.position.set(Math.cos(angle) * 0.28, 0.66, Math.sin(angle) * 0.28);
      pipeMesh.rotation.y = angle + Math.PI / 2;
      pipeMesh.rotation.z = Math.PI / 2;
      group.add(pipeMesh);
    }
  };

  // Bunsen Burner & Multi-Zone Flame
  const buildBunsenBurnerApparatus = (group: THREE.Group, v: VesselState) => {
    const burnerGroup = new THREE.Group();
    burnerGroup.name = 'Bunsen Burner';

    // Position burner directly underneath if heating, or offset slightly
    const burnerOffset = v.type === 'crucible' || v.type === 'liebigCondenser' ? (v.type === 'liebigCondenser' ? new THREE.Vector3(-0.65, 0, 0) : new THREE.Vector3(0, 0, 0)) : new THREE.Vector3(0, 0, 1.1);
    burnerGroup.position.copy(burnerOffset);

    // Cast Iron Heavy Base
    const baseGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.09, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9, roughness: 0.25 });
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.y = -0.045;
    baseMesh.receiveShadow = true;
    burnerGroup.add(baseMesh);

    // Air Intake Collar with Holes
    const collarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
    const brassMat = new THREE.MeshStandardMaterial({ color: '#D97706', metalness: 0.8, roughness: 0.3 });
    const collarMesh = new THREE.Mesh(collarGeo, brassMat);
    collarMesh.position.y = 0.08;
    burnerGroup.add(collarMesh);

    // Brass / Nickel Chimney Barrel Tube
    const chimneyGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.48, 24);
    const chimneyMesh = new THREE.Mesh(chimneyGeo, metalMat);
    chimneyMesh.position.y = 0.32;
    burnerGroup.add(chimneyMesh);

    // Gas Inlet Rubber Hose Tube
    const hoseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
    const hoseMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.7 });
    const hoseMesh = new THREE.Mesh(hoseGeo, hoseMat);
    hoseMesh.rotation.x = Math.PI / 2;
    hoseMesh.position.set(0, 0.06, -0.45);
    burnerGroup.add(hoseMesh);

    // Multi-Zone Flame
    const flameGroup = new THREE.Group();
    flameGroup.position.y = 0.56;

    let flameColorHex = '#38BDF8';
    if (v.contents.length > 0) {
      flameColorHex = getFlameColorByReagent(v.contents[0].reagentId);
    }

    // Inner Pale Blue Reducing Cone
    const innerConeGeo = new THREE.ConeGeometry(0.07, 0.32, 16);
    const innerConeMat = new THREE.MeshBasicMaterial({ color: '#E0F2FE' });
    const innerCone = new THREE.Mesh(innerConeGeo, innerConeMat);
    innerCone.position.y = 0.16;
    flameGroup.add(innerCone);

    // Outer Spectral Color Flame Plume
    const outerConeGeo = new THREE.ConeGeometry(0.14, 0.62, 16);
    const outerConeMat = new THREE.MeshBasicMaterial({
      color: flameColorHex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const outerCone = new THREE.Mesh(outerConeGeo, outerConeMat);
    outerCone.position.y = 0.31;
    flameGroup.add(outerCone);

    // Flame Core Tip Glow
    const glowGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: flameColorHex, transparent: true, opacity: 0.4 });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.y = 0.45;
    flameGroup.add(glowMesh);

    flameGroup.visible = v.isHeating;
    burnerGroup.add(flameGroup);
    flameGroupRef.current = flameGroup;

    group.add(burnerGroup);
  };

  // Crucible Tongs
  const buildCrucibleTongs = (group: THREE.Group) => {
    const tongsGroup = new THREE.Group();
    tongsGroup.position.set(0.75, 1.0, 0);

    const metalMat = new THREE.MeshStandardMaterial({ color: '#CBD5E1', metalness: 0.9, roughness: 0.2 });
    const arm1Geo = new THREE.CylinderGeometry(0.02, 0.02, 1.1, 12);
    const arm1 = new THREE.Mesh(arm1Geo, metalMat);
    arm1.rotation.z = Math.PI / 5;
    tongsGroup.add(arm1);

    const arm2 = new THREE.Mesh(arm1Geo, metalMat);
    arm2.rotation.z = -Math.PI / 5;
    tongsGroup.add(arm2);

    group.add(tongsGroup);
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[420px] touch-none select-none cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onClick={onVesselClick}
    >
      {/* HUD 3D Stage Banner */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-400 border border-cyan-500/30 flex items-center gap-2.5 shadow-xl pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-bold tracking-wider">3D WEBGL STUDIO RIG</span>
      </div>

      {/* Camera View Presets Control Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-10">
        <button
          onClick={(e) => { e.stopPropagation(); setCameraPreset('default'); }}
          title="Isometric Overview"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
            activePreset === 'default'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Overview</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setCameraPreset('meniscus'); }}
          title="Meniscus & Scale Close-up"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
            activePreset === 'meniscus'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Meniscus</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setCameraPreset('burner'); }}
          title="Bunsen Burner Flame Focus"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
            activePreset === 'burner'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Burner</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setCameraPreset('top'); }}
          title="Top-Down Vortex View"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
            activePreset === 'top'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vortex</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

        <button
          onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoverInfo && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono shadow-2xl z-20 transition-all transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div className="font-bold text-cyan-300">{hoverInfo.title}</div>
          <div className="text-[11px] text-slate-300">{hoverInfo.subtitle}</div>
        </div>
      )}

      {/* Active State Telemetry Badges */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        {vessel.isHeating && (
          <div className="bg-amber-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center gap-1.5 shadow-lg animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>HEATING ACTIVE</span>
          </div>
        )}
        {vessel.isStirring && (
          <div className="bg-cyan-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>MAGNETIC STIRRER ON</span>
          </div>
        )}
        {vessel.temperatureC > 60 && (
          <div className="bg-rose-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-rose-500/40 text-[11px] font-mono text-rose-300 flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>THERMAL EXPANSION</span>
          </div>
        )}
      </div>

      {/* Interaction Instruction Footnote */}
      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800 pointer-events-none">
        Click + Drag to Rotate • Scroll to Zoom
      </div>
    </div>
  );
};
