import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { X, Sun, Compass, LayoutGrid, Trash2, Maximize, Check, RotateCw } from 'lucide-react';

// Create a realistic solar cell texture based on orientation
function createSolarCellTexture(orientation = 'portrait') {
  const canvas = document.createElement('canvas');
  const isPortrait = orientation === 'portrait';
  canvas.width = isPortrait ? 512 : 1024;
  canvas.height = isPortrait ? 1024 : 512;
  const ctx = canvas.getContext('2d');

  // Deep navy background
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = isPortrait ? 6 : 12;
  const rows = isPortrait ? 12 : 6;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;

      // Cell gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#162038');
      grad.addColorStop(0.5, '#0b1120');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Busbars
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.lineWidth = 1;
      
      if (isPortrait) {
        for (let b = 1; b <= 4; b++) {
          const bx = x + (cellW * b) / 5;
          ctx.beginPath();
          ctx.moveTo(bx, y + 2);
          ctx.lineTo(bx, y + cellH - 2);
          ctx.stroke();
        }
      } else {
        for (let b = 1; b <= 4; b++) {
          const by = y + (cellH * b) / 5;
          ctx.beginPath();
          ctx.moveTo(x + 2, by);
          ctx.lineTo(x + cellW - 2, by);
          ctx.stroke();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

const ROOF_ANGLE = 15 * (Math.PI / 180);
const GAP = 0.02;

export default function Solar3DViewer({ initialPanelQty = 12, onClose, onApply }) {
  const mountRef = useRef(null);
  
  const [orientation, setOrientation] = useState('portrait');
  const [activeSlots, setActiveSlots] = useState(new Set()); 

  const activeSlotsRef = useRef(activeSlots);
  useEffect(() => {
    activeSlotsRef.current = activeSlots;
  }, [activeSlots]);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const gridMeshesRef = useRef([]); 

  // Auto layout function
  const handleAutoLayout = (qty, target = 'south', orient = orientation) => {
    const next = new Set();
    const ROWS = orient === 'portrait' ? 2 : 4;
    const COLS = orient === 'portrait' ? 8 : 4;
    const MAX_PER_ROOF = ROWS * COLS;
    
    // Auto fallback to 'both' if qty exceeds single roof capacity
    if (target === 'south' && qty > MAX_PER_ROOF) {
      target = 'both';
    }
    
    if (target === 'south') {
      let count = 0;
      const colsNeeded = Math.ceil(qty / ROWS);
      const startC = Math.max(0, Math.floor((COLS - colsNeeded) / 2));
      for (let c = startC; c < startC + colsNeeded; c++) {
        for (let r = 0; r < ROWS; r++) { 
          if (count < qty && c < COLS) {
            next.add(`south-${r}-${c}`);
            count++;
          }
        }
      }
      for (let r = 0; r < ROWS && count < qty; r++) {
        for (let c = 0; c < COLS && count < qty; c++) {
          if (!next.has(`south-${r}-${c}`)) {
            next.add(`south-${r}-${c}`);
            count++;
          }
        }
      }
    } else if (target === 'both') {
      const half = Math.ceil(qty / 2);
      
      const fillSide = (side, targetCount) => {
        let added = 0;
        const colsNeeded = Math.ceil(targetCount / ROWS);
        const startC = Math.max(0, Math.floor((COLS - colsNeeded) / 2));
        for (let c = startC; c < startC + colsNeeded; c++) {
          for (let r = 0; r < ROWS; r++) { 
            if (added < targetCount && c < COLS) {
              next.add(`${side}-${r}-${c}`);
              added++;
            }
          }
        }
        for (let r = 0; r < ROWS && added < targetCount; r++) {
          for (let c = 0; c < COLS && added < targetCount; c++) {
            if (!next.has(`${side}-${r}-${c}`)) {
              next.add(`${side}-${r}-${c}`);
              added++;
            }
          }
        }
        return added;
      };

      const southCount = fillSide('south', half);
      fillSide('north', qty - southCount);
    }
    
    setActiveSlots(next);
  };

  // Initial setup only once
  useEffect(() => {
    handleAutoLayout(initialPanelQty, 'south', 'portrait');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 3, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 35;
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(15, 30, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Ground
    const groundMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.9 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Expanded House Dimensions to fit up to 32 panels (16 per side)
    const houseGeo = new THREE.BoxGeometry(8.5, 3.2, 5);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.y = 1.6;
    house.castShadow = true;
    house.receiveShadow = true;
    scene.add(house);

    // Windows & Door
    const glassMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.1, metalness: 0.8 });
    const winGeo = new THREE.PlaneGeometry(1.5, 1.2);
    const win1 = new THREE.Mesh(winGeo, glassMat);
    win1.position.set(-2, 2.2, 2.51);
    scene.add(win1);
    const win2 = new THREE.Mesh(winGeo, glassMat);
    win2.position.set(2, 2.2, 2.51);
    scene.add(win2);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2), new THREE.MeshStandardMaterial({ color: '#475569' }));
    door.position.set(0, 1, 2.51);
    scene.add(door);

    // Roof Setup
    const roofLength = 5.2; 
    const roofWidth = 9.5;  
    const roofGeo = new THREE.BoxGeometry(roofWidth, 0.15, roofLength);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    
    const apexY = 4.0;
    const centerOffsetZ = (roofLength / 2) * Math.cos(ROOF_ANGLE);
    const centerOffsetY = (roofLength / 2) * Math.sin(ROOF_ANGLE);

    const southRoof = new THREE.Mesh(roofGeo, roofMat);
    southRoof.rotation.x = ROOF_ANGLE;
    southRoof.position.set(0, apexY - centerOffsetY, centerOffsetZ);
    southRoof.castShadow = true;
    southRoof.receiveShadow = true;
    scene.add(southRoof);
    sceneRef.current.southRoof = southRoof;

    const northRoof = new THREE.Mesh(roofGeo, roofMat);
    northRoof.rotation.x = -ROOF_ANGLE;
    northRoof.position.set(0, apexY - centerOffsetY, -centerOffsetZ);
    northRoof.castShadow = true;
    northRoof.receiveShadow = true;
    scene.add(northRoof);
    sceneRef.current.northRoof = northRoof;

    // Layout Groups for panels
    const layoutGroupSouth = new THREE.Group();
    southRoof.add(layoutGroupSouth);
    sceneRef.current.layoutGroupSouth = layoutGroupSouth;

    const layoutGroupNorth = new THREE.Group();
    northRoof.add(layoutGroupNorth);
    sceneRef.current.layoutGroupNorth = layoutGroupNorth;

    // Hover meshes
    const hoverMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const hoverMeshSouth = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), hoverMat);
    hoverMeshSouth.rotation.x = -Math.PI / 2;
    hoverMeshSouth.visible = false;
    southRoof.add(hoverMeshSouth);
    sceneRef.current.hoverMeshSouth = hoverMeshSouth;

    const hoverMeshNorth = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), hoverMat);
    hoverMeshNorth.rotation.x = -Math.PI / 2;
    hoverMeshNorth.visible = false;
    northRoof.add(hoverMeshNorth);
    sceneRef.current.hoverMeshNorth = hoverMeshNorth;

    // Raycaster Events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredSlot = null;

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gridMeshesRef.current);

      if (intersects.length > 0) {
        hoveredSlot = intersects[0].object;
        const isSouth = hoveredSlot.userData.side === 'south';
        const hMesh = isSouth ? hoverMeshSouth : hoverMeshNorth;
        const otherMesh = isSouth ? hoverMeshNorth : hoverMeshSouth;
        
        hMesh.position.copy(hoveredSlot.position);
        hMesh.position.y += 0.01;
        hMesh.visible = true;
        otherMesh.visible = false;
      } else {
        hoveredSlot = null;
        hoverMeshSouth.visible = false;
        hoverMeshNorth.visible = false;
      }
    };

    const onClick = () => {
      if (hoveredSlot) {
        const id = hoveredSlot.userData.id;
        setActiveSlots(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Effect to rebuild hitboxes and geometries when orientation changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const isPortrait = orientation === 'portrait';
    const PANEL_W = isPortrait ? 1.13 : 2.28;
    const PANEL_H = isPortrait ? 2.28 : 1.13;
    const ROWS = isPortrait ? 2 : 4;
    const COLS = isPortrait ? 8 : 4;
    const SPACING_X = PANEL_W + GAP;
    const SPACING_Z = PANEL_H + GAP;

    // Update hover meshes
    const newHoverGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(PANEL_W, PANEL_H));
    if(sceneRef.current.hoverMeshSouth.geometry) sceneRef.current.hoverMeshSouth.geometry.dispose();
    sceneRef.current.hoverMeshSouth.geometry = newHoverGeo;
    if(sceneRef.current.hoverMeshNorth.geometry) sceneRef.current.hoverMeshNorth.geometry.dispose();
    sceneRef.current.hoverMeshNorth.geometry = newHoverGeo;

    // Clear old hitboxes
    gridMeshesRef.current.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.parent.remove(mesh);
    });
    gridMeshesRef.current = [];

    const hitBoxGeo = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false }); 

    const buildGrid = (group, side) => {
      const startX = -(COLS * SPACING_X) / 2 + SPACING_X / 2;
      const startZ = -(ROWS * SPACING_Z) / 2 + SPACING_Z / 2;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const px = startX + c * SPACING_X;
          const pz = startZ + r * SPACING_Z;

          const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
          hitBox.rotation.x = -Math.PI / 2; 
          hitBox.position.set(px, 0.08, pz);
          hitBox.userData = { row: r, col: c, side, id: `${side}-${r}-${c}` };
          group.add(hitBox);
          gridMeshesRef.current.push(hitBox);
        }
      }
    };

    buildGrid(sceneRef.current.layoutGroupSouth, 'south');
    buildGrid(sceneRef.current.layoutGroupNorth, 'north');

  }, [orientation]);

  // Update visual panels based on activeSlots
  useEffect(() => {
    if (!sceneRef.current) return;
    const isPortrait = orientation === 'portrait';
    const PANEL_W = isPortrait ? 1.13 : 2.28;
    const PANEL_H = isPortrait ? 2.28 : 1.13;
    const CELL_W = isPortrait ? 1.07 : 2.22;
    const CELL_H = isPortrait ? 2.22 : 1.07;

    const southGroup = sceneRef.current.layoutGroupSouth;
    const northGroup = sceneRef.current.layoutGroupNorth;

    const clearPanels = (group) => {
      const toRemove = group.children.filter(c => c.userData.isPanel);
      toRemove.forEach(child => {
        child.children.forEach(mesh => {
          if (mesh.geometry) mesh.geometry.dispose();
        });
        group.remove(child);
      });
    };
    clearPanels(southGroup);
    clearPanels(northGroup);

    const panelTexture = createSolarCellTexture(orientation);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.3
    });
    const cellMat = new THREE.MeshStandardMaterial({
      map: panelTexture,
      metalness: 0.6,
      roughness: 0.25
    });

    const frameGeo = new THREE.BoxGeometry(PANEL_W, 0.04, PANEL_H);
    const cellGeo = new THREE.BoxGeometry(CELL_W, 0.042, CELL_H);

    gridMeshesRef.current.forEach(slot => {
      if (activeSlotsRef.current.has(slot.userData.id)) {
        const panelGroup = new THREE.Group();
        panelGroup.userData.isPanel = true;
        
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.castShadow = true;
        panelGroup.add(frame);

        const cells = new THREE.Mesh(cellGeo, cellMat);
        cells.castShadow = true;
        panelGroup.add(cells);

        panelGroup.position.set(slot.position.x, slot.position.y, slot.position.z);
        slot.parent.add(panelGroup);
      }
    });

  }, [activeSlots, orientation]);

  // Actions
  const toggleOrientation = () => {
    const newOrient = orientation === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(newOrient);
    
    let southCount = 0;
    let northCount = 0;
    activeSlots.forEach(id => {
      if (id.startsWith('south')) southCount++;
      if (id.startsWith('north')) northCount++;
    });
    const total = southCount + northCount;
    
    const maxPerRoof = newOrient === 'portrait' ? 16 : 16; 
    const totalCap = Math.min(total, maxPerRoof * (northCount > 0 ? 2 : 1));
    
    handleAutoLayout(totalCap, northCount > 0 ? 'both' : 'south', newOrient);
  };

  const handleFillAll = () => {
    const next = new Set();
    const ROWS = orientation === 'portrait' ? 2 : 4;
    const COLS = orientation === 'portrait' ? 8 : 4;
    ['south', 'north'].forEach(side => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          next.add(`${side}-${r}-${c}`);
        }
      }
    });
    setActiveSlots(next);
  };

  const handleClearAll = () => setActiveSlots(new Set());

  const setView = (type) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const c = cameraRef.current;
    if (type === '45') c.position.set(12, 10, 12);
    else if (type === 'top') c.position.set(0, 18, 0.1);
    else if (type === 'front') c.position.set(0, 3, 15);
  };

  // Calculate HUD Stats
  let southQty = 0;
  let northQty = 0;
  activeSlots.forEach(id => {
    if (id.startsWith('south')) southQty++;
    if (id.startsWith('north')) northQty++;
  });
  const totalQty = southQty + northQty;
  const kwp = (totalQty * 0.61).toFixed(2);
  const area = (totalQty * 2.58).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-7xl h-[95vh] flex flex-col md:flex-row relative shadow-2xl">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-800/80 hover:bg-rose-500 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 relative bg-[#0f172a] h-full" ref={mountRef}>
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 w-64 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 shadow-2xl pointer-events-none">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-amber-400" />
              <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">Cấu Hình Lắp Đặt</h4>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Tổng số pin:</span>
                <span className="text-emerald-400 font-black text-lg">{totalQty} <span className="text-xs font-medium text-emerald-500/70">tấm</span></span>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-[-8px]">
                <span>Mái trước: <span className="text-slate-300">{southQty}</span></span>
                <span>Mái sau: <span className="text-slate-300">{northQty}</span></span>
              </div>

              <div className="h-px bg-slate-800" />
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Công suất:</span>
                <span className="text-amber-400 font-black text-base">{kwp} <span className="text-xs font-medium text-amber-500/70">kWp</span></span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Diện tích mái:</span>
                <span className="text-blue-400 font-black text-base">{area} <span className="text-xs font-medium text-blue-500/70">m²</span></span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center leading-tight">
              Hover và Click trực tiếp lên mái nhà 3D bên phải để thêm/bớt tấm pin.
            </p>
          </div>
          
          <div className="absolute bottom-6 left-6 text-slate-500 text-[10px] sm:text-xs flex items-center gap-2 z-10 bg-slate-900/50 px-3 py-1.5 rounded-full pointer-events-none hidden sm:flex">
            <Compass className="w-4 h-4" /> Chuột trái: Xoay | Cuộn: Zoom | Chuột phải: Di chuyển
          </div>
        </div>

        <div className="w-full md:w-[320px] bg-slate-900/95 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10">
          
          <div>
            <h3 className="text-xl font-black text-white mb-1">Công Cụ Layout</h3>
            <p className="text-slate-400 text-xs">Tương tác kéo thả 3D chuyên nghiệp</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={toggleOrientation}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 rounded-xl text-sm font-semibold transition-all border border-indigo-700/50"
            >
              <RotateCw className="w-4 h-4" /> {orientation === 'portrait' ? 'Hướng: Xếp Dọc' : 'Hướng: Xếp Ngang'}
            </button>
            <div className="h-px bg-slate-800/80 my-2" />
            <button 
              onClick={() => handleAutoLayout(totalQty > 0 ? totalQty : 12, 'south')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" /> Lắp Mái Trước (Nam)
            </button>
            <button 
              onClick={() => handleAutoLayout(totalQty > 0 ? totalQty : 24, 'both')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" /> Lắp Cả 2 Mái (Trước & Sau)
            </button>
            <div className="flex gap-3 pt-1">
              <button 
                onClick={handleFillAll}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                <Maximize className="w-3.5 h-3.5" /> Lấp đầy
              </button>
              <button 
                onClick={handleClearAll}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa hết
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/80 my-2" />

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Góc camera</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setView('45')} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium">Phối cảnh 45°</button>
              <button onClick={() => setView('top')} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium">Từ đỉnh nóc</button>
              <button onClick={() => setView('front')} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium col-span-2">Mặt tiền nhà</button>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button 
              onClick={() => {
                if(onApply) onApply(totalQty);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20"
            >
              <Check className="w-5 h-5" /> Áp dụng vào Báo Giá
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-3">Thay đổi số lượng sẽ ảnh hưởng tới báo giá & thời gian thu hồi vốn.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
