
        window.addEventListener('error', function(e) {
            alert("Lỗi JS: " + e.message + " ở dòng " + e.lineno);
        });
        window.addEventListener('unhandledrejection', function(e) {
            alert("Lỗi Promise: " + (e.reason && e.reason.stack ? e.reason.stack : e.reason));
        });

        // --- 1. Dữ liệu (Database) ---
        const panels = [
            { id: 'ja610', name: 'JA Solar JAM66D45 LB 610W', w: 1.134, h: 2.28, power: 610 },
            { id: 'ja630', name: 'JA Solar JAM72D42 LB 630W', w: 1.134, h: 2.38, power: 630 },
            { id: 'jinko580', name: 'Jinko Solar Tiger Neo 580W', w: 1.134, h: 2.278, power: 580 }
        ];

        const packages = [
            { id: 'F1', kwp: 2.3, name: 'SOLAR F1 (2.3 kWp)', price: '47.800.000 VNĐ' },
            { id: 'F2', kwp: 4.6, name: 'SOLAR F2 (4.6 kWp)', price: '68.500.000 VNĐ' },
            { id: 'F3', kwp: 5.8, name: 'SOLAR F3 (5.8 kWp)', price: '88.000.000 VNĐ' },
            { id: 'F4', kwp: 6.9, name: 'SOLAR F4 (6.9 kWp)', price: '104.700.000 VNĐ' },
            { id: 'F5', kwp: 8.1, name: 'SOLAR F5 (8.1 kWp)', price: '114.900.000 VNĐ' },
            { id: 'F6', kwp: 9.3, name: 'SOLAR F6 (9.3 kWp)', price: '123.600.000 VNĐ' },
            { id: 'F7', kwp: 11.6, name: 'SOLAR F7 (11.6 kWp)', price: '203.000.000 VNĐ' },
            { id: 'F8', kwp: 13.9, name: 'SOLAR F8 (13.9 kWp)', price: '217.900.000 VNĐ' },
            { id: 'F9', kwp: 17.4, name: 'SOLAR F9 (17.4 kWp)', price: '239.000.000 VNĐ' },
            { id: 'F10', kwp: 22.0, name: 'SOLAR F10 (22.0 kWp)', price: '329.300.000 VNĐ' },
        ];

        // --- 2. Biến toàn cục (State) ---
        let invertersConfig = [
            {
                id: Date.now(),
                model: "Sungrow SG10RS",
                type: "on-grid", // Giả lập On-grid ghép nối theo yêu cầu user
                numStrings: 3,
                panelModel: "ja610",
                batteryModel: "none"
            },
            {
                id: Date.now() + 1,
                model: "Sungrow SH10RT",
                type: "hybrid",
                numStrings: 2,
                panelModel: "ja610",
                batteryModel: "Pin Lithium Sungrow MBL160"
            }
        ];

        let roofLength = parseFloat(document.getElementById('roofLength').value) || 10;
        let roofWidth = parseFloat(document.getElementById('roofWidth').value) || 6;
        let scale = 1; 
        let panelsOnRoof = []; 
        let draggingPanelIndex = -1;
        let dragOffset = {x: 0, y: 0};
        let currentRotX = 60;
        let currentRotZ = -35;
        let currentZoom = 1;
        let isRotatingScene = false;
        let lastMousePos = {x: 0, y: 0};
        let customBars = []; // Mảng lưu các thanh ray tùy chỉnh {type: 'horizontal'|'vertical', pos: <giá trị>}
        let draggingBarIndex = -1;
        
        let isWiringMode = false;
        let manualStrings = []; 
        let currentString = []; // mảng chứa index của các tấm pin đang được nối dở dang

        function updateSceneTransform() {
            if (scene.classList.contains('view-3d')) {
                scene.style.transform = `perspective(1200px) rotateX(${currentRotX}deg) rotateZ(${currentRotZ}deg) scale(${currentZoom})`;
            } else {
                scene.style.transform = `scale(${currentZoom})`;
            }
        }

        const roofCanvas = document.getElementById('roofCanvas');
        const roofCtx = roofCanvas.getContext('2d');
        const topCanvas = document.getElementById('topCanvas');
        const topCtx = topCanvas.getContext('2d');
        const scene = document.getElementById('scene');
        const wrapper = document.getElementById('canvasWrapper');
        const panelSelect = document.getElementById('panelType');
        const orientationSelect = document.getElementById('panelOrientation');

        // --- 3. Khởi tạo ---
        function init() {
        window.externalTargetQty = null;
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SET_INITIAL_QTY') {
                window.externalTargetQty = event.data.qty;
                // Run auto layout if panels empty
                if (panelsOnRoof.length === 0) {
                    setTimeout(() => {
                        autoLayout();
                    }, 500);
                }
            }
        });

            panels.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                panelSelect.appendChild(opt);
            });
            
            renderInvertersList();

            resizeCanvas();
            window.addEventListener('resize', () => {
                resizeCanvas();
                draw();
            });

            document.getElementById('roofType').addEventListener('change', e => {
                document.getElementById('warningFibro').style.display = (e.target.value === 'fibro') ? 'block' : 'none';
                draw();
            });
            document.getElementById('installType').addEventListener('change', e => {
                document.getElementById('frameHeightGroup').style.display = (e.target.value === 'khungsat') ? 'block' : 'none';
                document.getElementById('frameTiltGroup').style.display = (e.target.value === 'khungsat') ? 'block' : 'none';
                document.getElementById('frameStyleGroup').style.display = (e.target.value === 'khungsat') ? 'block' : 'none';
                document.getElementById('pillarStyleGroup').style.display = (e.target.value === 'khungsat') ? 'block' : 'none';
                scene.setAttribute('data-install', e.target.value);
                draw();
            });

            document.getElementById('frameTilt').addEventListener('input', e => {
                document.getElementById('frameTiltLabel').innerText = e.target.value;
                draw();
            });

            document.getElementById('frameStyle').addEventListener('change', e => {
                document.getElementById('customFrameControls').style.display = (e.target.value === 'custom') ? 'block' : 'none';
                if (e.target.value === 'custom' && customBars.length === 0 && panelsOnRoof.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    panelsOnRoof.forEach(p => {
                        if(p.x < minX) minX = p.x; if(p.y < minY) minY = p.y;
                        if(p.x + p.w > maxX) maxX = p.x + p.w; if(p.y + p.h > maxY) maxY = p.y + p.h;
                    });
                    customBars.push({type: 'vertical', pos: minX});
                    customBars.push({type: 'vertical', pos: maxX});
                    customBars.push({type: 'horizontal', pos: minY});
                    customBars.push({type: 'horizontal', pos: maxY});
                    for(let x = minX + 1.2; x < maxX - 0.1; x += 1.2) customBars.push({type: 'vertical', pos: x});
                    for(let y = minY + 1.2; y < maxY - 0.1; y += 1.2) customBars.push({type: 'horizontal', pos: y});
                }
                draw();
            });
            document.getElementById('btnAddHBar').addEventListener('click', () => {
                if (panelsOnRoof.length === 0) return;
                let minY = Infinity, maxY = -Infinity;
                panelsOnRoof.forEach(p => {
                    if(p.y < minY) minY = p.y;
                    if(p.y + p.h > maxY) maxY = p.y + p.h;
                });
                customBars.push({type: 'horizontal', pos: (minY + maxY)/2});
                draw();
            });
            document.getElementById('btnAddVBar').addEventListener('click', () => {
                if (panelsOnRoof.length === 0) return;
                let minX = Infinity, maxX = -Infinity;
                panelsOnRoof.forEach(p => {
                    if(p.x < minX) minX = p.x;
                    if(p.x + p.w > maxX) maxX = p.x + p.w;
                });
                customBars.push({type: 'vertical', pos: (minX + maxX)/2});
                draw();
            });
            document.getElementById('pillarStyle').addEventListener('change', draw);

            document.getElementById('frameHeight').addEventListener('input', e => {
                document.getElementById('frameHeightLabel').innerText = e.target.value;
                draw();
            });

            document.getElementById('roofLength').addEventListener('change', e => {
                roofLength = parseFloat(e.target.value) || 10;
                panelsOnRoof = [];
                draw();
                updateStats();
            });
            document.getElementById('roofWidth').addEventListener('change', e => {
                roofWidth = parseFloat(e.target.value) || 6;
                panelsOnRoof = [];
                draw();
                updateStats();
            });
            document.getElementById('manualPanelQty').addEventListener('input', updateStats);
            document.getElementById('btnAutoLayout').addEventListener('click', autoLayout);
            document.getElementById('btnClear').addEventListener('click', () => {
                panelsOnRoof = [];
                manualStrings = [];
                currentString = [];
                draw();
                updateStats();
            });
            
            const btnWiringMode = document.getElementById('btnWiringMode');
            const wiringControls = document.getElementById('wiringControls');
            btnWiringMode.addEventListener('click', () => {
                isWiringMode = !isWiringMode;
                if (isWiringMode) {
                    btnWiringMode.textContent = "✍️ Đang Vẽ Dây... (Bật)";
                    btnWiringMode.style.backgroundColor = "#e0f2fe";
                    btnWiringMode.style.borderColor = "#38bdf8";
                    btnWiringMode.style.color = "#0284c7";
                    wiringControls.style.display = "block";
                    scene.classList.remove('view-3d'); // Bắt buộc về 2D khi vẽ dây
                    document.getElementById('btn2D').classList.add('active');
                    document.getElementById('btn3D').classList.remove('active');
                    updateSceneTransform();
                } else {
                    btnWiringMode.textContent = "✍️ Vẽ Dây Thủ Công (Tắt)";
                    btnWiringMode.style.backgroundColor = "#f1f5f9";
                    btnWiringMode.style.borderColor = "#94a3b8";
                    btnWiringMode.style.color = "#334155";
                    wiringControls.style.display = "none";
                    if (currentString.length > 0) {
                        manualStrings.push([...currentString]);
                        currentString = [];
                    }
                }
                draw();
            });
            
            document.getElementById('btnClearWiring').addEventListener('click', () => {
                manualStrings = [];
                currentString = [];
                draw();
            });
            document.getElementById('btn2D').addEventListener('click', () => {
                document.getElementById('btn2D').classList.add('active');
                document.getElementById('btn3D').classList.remove('active');
                scene.classList.remove('view-3d');
                updateSceneTransform();
                draw();
            });
            document.getElementById('btn3D').addEventListener('click', () => {
                document.getElementById('btn3D').classList.add('active');
                document.getElementById('btn2D').classList.remove('active');
                scene.classList.add('view-3d');
                updateSceneTransform();
                draw();
            });

            document.getElementById('btnToggleStats').addEventListener('click', () => {
                const content = document.getElementById('statsContent');
                const iconShow = document.getElementById('iconShowStats');
                const iconHide = document.getElementById('iconHideStats');
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    iconShow.style.display = 'none';
                    iconHide.style.display = 'block';
                } else {
                    content.classList.add('hidden');
                    iconShow.style.display = 'block';
                    iconHide.style.display = 'none';
                }
            });

            setupDragAndDrop();
            setupCanvasInteraction();
            draw();
            updateStats();
        }

        function renderInvertersList() {
            const container = document.getElementById('inverterListContainer');
            container.innerHTML = '';
            
            invertersConfig.forEach((inv, index) => {
                const card = document.createElement('div');
                card.className = 'inverter-card';
                
                let panelOptions = panels.map(p => `<option value="${p.id}" ${inv.panelModel === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
                
                card.innerHTML = `
                    <div class="inverter-card-title">
                        Inverter ${index + 1}
                        ${invertersConfig.length > 1 ? `<button class="btn-remove-inv" onclick="removeInverter(${inv.id})">Xóa</button>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <label>Hãng / Model</label>
                        <select class="form-control" onchange="updateInverter(${inv.id}, 'model', this.value); updateInverter(${inv.id}, 'type', (this.value.includes('Deye 10kW') || this.value.includes('SMA')) ? 'on-grid' : 'hybrid');">
                            <option value="Sungrow SG3.0RS" ${inv.model === 'Sungrow SG3.0RS' ? 'selected' : ''}>Sungrow SG3.0RS (3kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG5.0RS" ${inv.model === 'Sungrow SG5.0RS' ? 'selected' : ''}>Sungrow SG5.0RS (5kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG10RS" ${inv.model === 'Sungrow SG10RS' ? 'selected' : ''}>Sungrow SG10RS (10kW - 1 Pha Hòa Lưới)</option>
<option value="Sungrow SG15RT" ${inv.model === 'Sungrow SG15RT' ? 'selected' : ''}>Sungrow SG15RT (15kW - 3 Pha Hòa Lưới)</option>
<option value="Sungrow MG5RL" ${inv.model === 'Sungrow MG5RL' ? 'selected' : ''}>Sungrow MG5RL (5kW - 1 Pha Hybrid Áp Thấp)</option>
<option value="Sungrow MG6RL" ${inv.model === 'Sungrow MG6RL' ? 'selected' : ''}>Sungrow MG6RL (6kW - 1 Pha Hybrid Áp Thấp)</option>
<option value="Sungrow SH5.0RS" ${inv.model === 'Sungrow SH5.0RS' ? 'selected' : ''}>Sungrow SH5.0RS (5kW - 1 Pha Hybrid Áp Cao)</option>
<option value="Sungrow MG10TL" ${inv.model === 'Sungrow MG10TL' ? 'selected' : ''}>Sungrow MG10TL (10kW - 3 Pha Hybrid Biệt Thự)</option>
<option value="Sungrow SH10RT" ${inv.model === 'Sungrow SH10RT' ? 'selected' : ''}>Sungrow SH10RT (10kW - 3 Pha Hybrid Áp Cao)</option>
                        </select>
                    </div>
                    
                    <div class="flex-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Loại Tấm Pin</label>
                            <select class="form-control" onchange="updateInverter(${inv.id}, 'panelModel', this.value)">
                                ${panelOptions}
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Số String</label>
                            <input type="number" class="form-control" value="${inv.numStrings}" min="1" max="6" onchange="updateInverter(${inv.id}, 'numStrings', parseInt(this.value))">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Pin Lưu trữ (Battery)</label>
                        <select class="form-control" onchange="updateInverter(${inv.id}, 'batteryModel', this.value)">
                            <option value="none" ${inv.batteryModel === 'none' ? 'selected' : ''}>Không có</option>
                            <option value="Pin Lithium Sungrow MGL060" ${inv.batteryModel === 'Pin Lithium Sungrow MGL060' ? 'selected' : ''}>Pin Lithium Sungrow MGL060 (6.0 kWh - Áp Thấp)</option>
<option value="Pin Lithium Sungrow MBL160" ${inv.batteryModel === 'Pin Lithium Sungrow MBL160' ? 'selected' : ''}>Pin Lithium Sungrow MBL160 (16.0 kWh - Áp Thấp)</option>
<option value="Pin Cao Áp Sungrow SBS050" ${inv.batteryModel === 'Pin Cao Áp Sungrow SBS050' ? 'selected' : ''}>Pin Cao Áp Sungrow SBS050 (5.12 kWh - Áp Cao)</option>
<option value="Pin Cao Áp Sungrow SBR096" ${inv.batteryModel === 'Pin Cao Áp Sungrow SBR096' ? 'selected' : ''}>Pin Cao Áp Sungrow SBR096 (9.6 kWh - Áp Cao)</option>
                        </select>
                    </div>
                `;
                container.appendChild(card);
            });
            updateStats();
        }
        
        // Cần gán global cho onchange html
        window.updateInverter = function(id, field, value) {
            const inv = invertersConfig.find(i => i.id === id);
            if (inv) {
                inv[field] = value;
                updateStats();
            }
        };
        
        window.removeInverter = function(id) {
            invertersConfig = invertersConfig.filter(i => i.id !== id);
            renderInvertersList();
        };
        
        document.getElementById('btnAddInverter').addEventListener('click', () => {
            invertersConfig.push({
                id: Date.now(),
                model: "Luxpower 5kW",
                type: "hybrid",
                strings: 2,
                panelModel: "ae580",
                batteryModel: "none"
            });
            renderInvertersList();
        });

        function resizeCanvas() {
            roofCanvas.width = wrapper.clientWidth;
            roofCanvas.height = wrapper.clientHeight;
            topCanvas.width = wrapper.clientWidth;
            topCanvas.height = wrapper.clientHeight;
        }

        function getActivePanelSize() {
            const pType = panels.find(p => p.id === panelSelect.value);
            const isPortrait = orientationSelect.value === 'portrait';
            return {
                w: isPortrait ? pType.w : pType.h,
                h: isPortrait ? pType.h : pType.w,
                power: pType.power
            };
        }

        // --- 4. Logic Vẽ ---
        function draw() {
            roofCtx.clearRect(0, 0, roofCanvas.width, roofCanvas.height);
            topCtx.clearRect(0, 0, topCanvas.width, topCanvas.height);

            const padding = 80;
            const availableW = roofCanvas.width - padding * 2;
            const availableH = roofCanvas.height - padding * 2;
            
            const scaleX = availableW / roofLength;
            const scaleY = availableH / roofWidth;
            scale = Math.min(scaleX, scaleY);

            const roofPxW = roofLength * scale;
            const roofPxH = roofWidth * scale;
            const startX = (roofCanvas.width - roofPxW) / 2;
            const startY = (roofCanvas.height - roofPxH) / 2;

            const roofType = document.getElementById('roofType').value;
            const installType = document.getElementById('installType').value;

            roofCtx.shadowColor = 'rgba(0,0,0,0.15)';
            roofCtx.shadowBlur = 20;
            roofCtx.shadowOffsetX = 0;
            roofCtx.shadowOffsetY = 10;
            
            if (roofType === 'ton') {
                const pCanvas = document.createElement('canvas');
                const pw = Math.max(8, 0.25 * scale); // 25cm sóng tôn
                pCanvas.width = pw;
                pCanvas.height = 10;
                const pCtx = pCanvas.getContext('2d');
                const grad = pCtx.createLinearGradient(0, 0, pw, 0);
                grad.addColorStop(0, '#94a3b8');
                grad.addColorStop(0.3, '#cbd5e1'); // highlight
                grad.addColorStop(0.7, '#94a3b8');
                grad.addColorStop(1, '#64748b'); // shadow
                pCtx.fillStyle = grad;
                pCtx.fillRect(0, 0, pw, 10);
                
                roofCtx.fillStyle = roofCtx.createPattern(pCanvas, 'repeat');
                roofCtx.translate(startX, startY);
                roofCtx.fillRect(0, 0, roofPxW, roofPxH);
                roofCtx.translate(-startX, -startY);
                
                roofCtx.shadowColor = 'transparent'; 
                roofCtx.strokeStyle = '#475569';
                roofCtx.lineWidth = 3;
                roofCtx.strokeRect(startX, startY, roofPxW, roofPxH);
            } 
            else if (roofType === 'fibro') {
                const pCanvas = document.createElement('canvas');
                const pw = Math.max(6, 0.15 * scale); 
                pCanvas.width = pw;
                pCanvas.height = 10;
                const pCtx = pCanvas.getContext('2d');
                const grad = pCtx.createLinearGradient(0, 0, pw, 0);
                grad.addColorStop(0, '#6b7280');
                grad.addColorStop(0.5, '#9ca3af');
                grad.addColorStop(1, '#4b5563');
                pCtx.fillStyle = grad;
                pCtx.fillRect(0, 0, pw, 10);
                
                roofCtx.fillStyle = roofCtx.createPattern(pCanvas, 'repeat');
                roofCtx.translate(startX, startY);
                roofCtx.fillRect(0, 0, roofPxW, roofPxH);
                
                roofCtx.strokeStyle = 'rgba(0,0,0,0.15)';
                roofCtx.lineWidth = 2;
                const stepY = 1.5 * scale;
                for(let y = stepY; y < roofPxH; y += stepY) {
                    roofCtx.beginPath();
                    roofCtx.moveTo(0, y);
                    roofCtx.lineTo(roofPxW, y);
                    roofCtx.stroke();
                }
                roofCtx.translate(-startX, -startY);
                
                roofCtx.shadowColor = 'transparent';
                roofCtx.strokeStyle = '#374151';
                roofCtx.lineWidth = 3;
                roofCtx.strokeRect(startX, startY, roofPxW, roofPxH);
            }
            else if (roofType === 'ngoi') {
                const pCanvas = document.createElement('canvas');
                const pw = Math.max(8, 0.25 * scale); 
                const ph = Math.max(10, 0.35 * scale); 
                pCanvas.width = pw;
                pCanvas.height = ph;
                const pCtx = pCanvas.getContext('2d');
                
                const grad = pCtx.createLinearGradient(0, 0, pw, 0);
                grad.addColorStop(0, '#7f1d1d');
                grad.addColorStop(0.5, '#ef4444'); 
                grad.addColorStop(1, '#7f1d1d');
                pCtx.fillStyle = grad;
                pCtx.fillRect(0, 0, pw, ph);
                
                pCtx.fillStyle = 'rgba(0,0,0,0.4)';
                pCtx.fillRect(0, ph - 3, pw, 3);
                pCtx.fillStyle = 'rgba(255,255,255,0.2)';
                pCtx.fillRect(0, 0, pw, 2);

                roofCtx.fillStyle = roofCtx.createPattern(pCanvas, 'repeat');
                roofCtx.translate(startX, startY);
                roofCtx.fillRect(0, 0, roofPxW, roofPxH);
                roofCtx.translate(-startX, -startY);
                
                roofCtx.shadowColor = 'transparent';
                roofCtx.strokeStyle = '#450a0a';
                roofCtx.lineWidth = 3;
                roofCtx.strokeRect(startX, startY, roofPxW, roofPxH);
            }
            else if (roofType === 'betong') {
                const pCanvas = document.createElement('canvas');
                pCanvas.width = 120;
                pCanvas.height = 120;
                const pCtx = pCanvas.getContext('2d');
                pCtx.fillStyle = '#e5e7eb';
                pCtx.fillRect(0, 0, 120, 120);
                for(let i=0; i < 2000; i++) {
                    pCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.08)';
                    pCtx.fillRect(Math.random()*120, Math.random()*120, Math.random()*2.5, Math.random()*2.5);
                }
                
                roofCtx.fillStyle = roofCtx.createPattern(pCanvas, 'repeat');
                roofCtx.translate(startX, startY);
                roofCtx.fillRect(0, 0, roofPxW, roofPxH);
                roofCtx.translate(-startX, -startY);
                
                roofCtx.shadowColor = 'transparent';
                roofCtx.strokeStyle = '#9ca3af';
                roofCtx.lineWidth = 3;
                roofCtx.strokeRect(startX, startY, roofPxW, roofPxH);
            }

            roofCtx.fillStyle = (roofType === 'ngoi' || roofType === 'fibro') ? '#ffffff' : '#1e293b';
            roofCtx.font = 'bold 14px Inter';
            roofCtx.textAlign = 'center';
            roofCtx.fillText(`${roofLength}m`, startX + roofPxW / 2, startY - 10);
            roofCtx.textAlign = 'right';
            roofCtx.textBaseline = 'middle';
            roofCtx.fillText(`${roofWidth}m`, startX - 10, startY + roofPxH / 2);
            roofCtx.textBaseline = 'alphabetic';

            const is3D = scene.classList.contains('view-3d');
            let hZ = 0;
            if (installType === 'khungsat') {
                const heightMeters = parseFloat(document.getElementById('frameHeight').value) || 1.0;
                hZ = heightMeters * scale; 
            } else {
                hZ = 10;
            }

            let tiltAngle = 0;
            if (installType === 'khungsat') {
                tiltAngle = parseFloat(document.getElementById('frameTilt').value) || 0;
            }

            if (is3D) {
                topCanvas.style.transform = `translateZ(${hZ}px) rotateX(${-tiltAngle}deg)`;
                topCanvas.style.filter = `drop-shadow(${hZ * 0.8}px ${hZ * 0.8}px ${hZ * 0.4}px rgba(0,0,0,0.5))`;
            } else {
                topCanvas.style.transform = `translateZ(0px)`;
                topCanvas.style.filter = 'none';
            }
            
            const pillarsContainer = document.getElementById('pillarsContainer');
            pillarsContainer.innerHTML = '';

            if (installType === 'khungsat' && panelsOnRoof.length > 0) {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                panelsOnRoof.forEach(p => {
                    if(p.x < minX) minX = p.x;
                    if(p.y < minY) minY = p.y;
                    if(p.x + p.w > maxX) maxX = p.x + p.w;
                    if(p.y + p.h > maxY) maxY = p.y + p.h;
                });
                
                minX = startX + minX * scale;
                minY = startY + minY * scale;
                maxX = startX + maxX * scale;
                maxY = startY + maxY * scale;
                
                const frameStyle = document.getElementById('frameStyle') ? document.getElementById('frameStyle').value : 'grid';
                if (frameStyle === 'custom' && customBars.length > 0) {
                    let cMinX = Infinity, cMaxX = -Infinity, cMinY = Infinity, cMaxY = -Infinity;
                    customBars.forEach(b => {
                        if (b.type === 'vertical') { if (b.pos < cMinX) cMinX = b.pos; if (b.pos > cMaxX) cMaxX = b.pos; }
                        else { if (b.pos < cMinY) cMinY = b.pos; if (b.pos > cMaxY) cMaxY = b.pos; }
                    });
                    if (cMinX !== Infinity) { minX = startX + cMinX * scale; maxX = startX + cMaxX * scale; }
                    if (cMinY !== Infinity) { minY = startY + cMinY * scale; maxY = startY + cMaxY * scale; }
                }
                
                const stepScale = 3 * scale;
                const numCols = Math.ceil((maxX - minX) / stepScale) || 1;
                const numRows = Math.ceil((maxY - minY) / stepScale) || 1;

                const pillarStyle = document.getElementById('pillarStyle') ? document.getElementById('pillarStyle').value : 'grid';
                let pillarPoints = [];
                if (pillarStyle === 'corners') {
                    pillarPoints.push({x: minX, y: minY});
                    pillarPoints.push({x: maxX, y: minY});
                    pillarPoints.push({x: minX, y: maxY});
                    pillarPoints.push({x: maxX, y: maxY});
                } else if (pillarStyle === 'center') {
                    pillarPoints.push({x: (minX + maxX)/2, y: (minY + maxY)/2});
                } else {
                    for(let i = 0; i <= numCols; i++) {
                        let x = minX + (i / numCols) * (maxX - minX);
                        for(let j = 0; j <= numRows; j++) {
                            let y = minY + (j / numRows) * (maxY - minY);
                            pillarPoints.push({x: x, y: y});
                        }
                    }
                }

                if (is3D) {
                    const theta = -tiltAngle * Math.PI / 180;
                    const centerY = topCanvas.height / 2;
                    
                    pillarPoints.forEach(pt => {
                        const pillar = document.createElement('div');
                        pillar.className = 'pillar';
                        
                        const yLocal = pt.y - centerY;
                        const yScene = centerY + yLocal * Math.cos(theta);
                        const zScene = hZ + yLocal * Math.sin(theta);
                        
                        pillar.style.left = `${pt.x - 3}px`;
                        pillar.style.top = `${yScene}px`;
                        pillar.style.height = `${Math.max(0, zScene)}px`;
                        if(pillarStyle === 'center') {
                            pillar.style.width = '12px';
                            pillar.style.marginLeft = '-3px';
                        }
                        pillarsContainer.appendChild(pillar);
                    });
                } else {
                    roofCtx.fillStyle = '#1f2937';
                    pillarPoints.forEach(pt => {
                        let s = pillarStyle === 'center' ? 16 : 8;
                        roofCtx.fillRect(pt.x - s/2, pt.y - s/2, s, s);
                    });
                }
                
                // Vẽ khung sắt trên topCtx
                topCtx.strokeStyle = '#4b5563'; 
                topCtx.lineWidth = 6;
                if (frameStyle !== 'custom') {
                    topCtx.strokeRect(minX, minY, maxX - minX, maxY - minY);
                }
                
                if (frameStyle === 'custom') {
                    topCtx.lineWidth = 4;
                    topCtx.beginPath();
                    customBars.forEach(bar => {
                        if (bar.type === 'vertical') {
                            let x = startX + bar.pos * scale;
                            topCtx.moveTo(x, minY);
                            topCtx.lineTo(x, maxY);
                        } else if (bar.type === 'horizontal') {
                            let y = startY + bar.pos * scale;
                            topCtx.moveTo(minX, y);
                            topCtx.lineTo(maxX, y);
                        }
                    });
                    topCtx.stroke();
                } else if (frameStyle !== 'perimeter') {
                    topCtx.lineWidth = 4;
                    topCtx.beginPath();
                    if (frameStyle === 'grid' || frameStyle === 'vertical') {
                        for(let x = minX + 1.2 * scale; x < maxX; x += 1.2 * scale) {
                            topCtx.moveTo(x, minY);
                            topCtx.lineTo(x, maxY);
                        }
                    }
                    if (frameStyle === 'grid' || frameStyle === 'horizontal') {
                        for(let y = minY + 1.2 * scale; y < maxY; y += 1.2 * scale) {
                            topCtx.moveTo(minX, y);
                            topCtx.lineTo(maxX, y);
                        }
                    }
                    topCtx.stroke();
                }
            }

            panelsOnRoof.forEach((p, index) => {
                const pxX = startX + p.x * scale;
                const pxY = startY + p.y * scale;
                const pxW = p.w * scale;
                const pxH = p.h * scale;

                topCtx.fillStyle = '#0f2027';
                topCtx.fillRect(pxX, pxY, pxW, pxH);
                
                topCtx.strokeStyle = 'rgba(255,255,255,0.15)';
                topCtx.lineWidth = 0.5;
                const cellsX = 6;
                const cellsY = p.w > p.h ? 6 : 12; 
                
                for(let i=1; i<cellsX; i++) {
                    topCtx.beginPath();
                    topCtx.moveTo(pxX + (pxW/cellsX)*i, pxY);
                    topCtx.lineTo(pxX + (pxW/cellsX)*i, pxY + pxH);
                    topCtx.stroke();
                }
                for(let j=1; j<cellsY; j++) {
                    topCtx.beginPath();
                    topCtx.moveTo(pxX, pxY + (pxH/cellsY)*j);
                    topCtx.lineTo(pxX + pxW, pxY + (pxH/cellsY)*j);
                    topCtx.stroke();
                }

                topCtx.strokeStyle = '#e2e8f0';
                topCtx.lineWidth = index === draggingPanelIndex ? 3 : 2;
                if(index === draggingPanelIndex) topCtx.strokeStyle = '#00A859';
                topCtx.strokeRect(pxX, pxY, pxW, pxH);
            });

            document.querySelectorAll('.extrusion-layer').forEach(el => el.remove());
            if (is3D && panelsOnRoof.length > 0) {
                const numLayers = 5; 
                for(let i = 1; i <= numLayers; i++) {
                    const layer = document.createElement('canvas');
                    layer.className = 'extrusion-layer';
                    layer.width = topCanvas.width;
                    layer.height = topCanvas.height;
                    layer.style.position = 'absolute';
                    layer.style.top = topCanvas.style.top;
                    layer.style.left = topCanvas.style.left;
                    layer.style.width = topCanvas.style.width;
                    layer.style.height = topCanvas.style.height;
                    layer.style.pointerEvents = 'none';
                    const lCtx = layer.getContext('2d');
                    
                    if (installType === 'khungsat') {
                        let mnX = Infinity, mnY = Infinity, mxX = -Infinity, mxY = -Infinity;
                        panelsOnRoof.forEach(p => {
                            if(p.x < mnX) mnX = p.x; if(p.y < mnY) mnY = p.y;
                            if(p.x + p.w > mxX) mxX = p.x + p.w; if(p.y + p.h > mxY) mxY = p.y + p.h;
                        });
                        mnX = startX + mnX * scale; mnY = startY + mnY * scale;
                        mxX = startX + mxX * scale; mxY = startY + mxY * scale;
                        
                        const frameStyle = document.getElementById('frameStyle') ? document.getElementById('frameStyle').value : 'grid';
                        lCtx.strokeStyle = '#374151'; 
                        lCtx.lineWidth = 6;
                        if (frameStyle === 'custom' && customBars.length > 0) {
                            let cMinX = Infinity, cMaxX = -Infinity, cMinY = Infinity, cMaxY = -Infinity;
                            customBars.forEach(b => {
                                if (b.type === 'vertical') { if (b.pos < cMinX) cMinX = b.pos; if (b.pos > cMaxX) cMaxX = b.pos; }
                                else { if (b.pos < cMinY) cMinY = b.pos; if (b.pos > cMaxY) cMaxY = b.pos; }
                            });
                            if (cMinX !== Infinity) { mnX = startX + cMinX * scale; mxX = startX + cMaxX * scale; }
                            if (cMinY !== Infinity) { mnY = startY + cMinY * scale; mxY = startY + cMaxY * scale; }
                        }

                        if (frameStyle !== 'custom') {
                            lCtx.strokeRect(mnX, mnY, mxX - mnX, mxY - mnY);
                        }
                        
                        if (frameStyle === 'custom') {
                            lCtx.lineWidth = 4;
                            lCtx.beginPath();
                            customBars.forEach(bar => {
                                if (bar.type === 'vertical') {
                                    let x = startX + bar.pos * scale;
                                    lCtx.moveTo(x, mnY); lCtx.lineTo(x, mxY);
                                } else if (bar.type === 'horizontal') {
                                    let y = startY + bar.pos * scale;
                                    lCtx.moveTo(mnX, y); lCtx.lineTo(mxX, y);
                                }
                            });
                            lCtx.stroke();
                        } else if (frameStyle !== 'perimeter') {
                            lCtx.lineWidth = 4;
                            lCtx.beginPath();
                            if (frameStyle === 'grid' || frameStyle === 'vertical') {
                                for(let x = mnX + 1.2 * scale; x < mxX; x += 1.2 * scale) { lCtx.moveTo(x, mnY); lCtx.lineTo(x, mxY); }
                            }
                            if (frameStyle === 'grid' || frameStyle === 'horizontal') {
                                for(let y = mnY + 1.2 * scale; y < mxY; y += 1.2 * scale) { lCtx.moveTo(mnX, y); lCtx.lineTo(mxX, y); }
                            }
                            lCtx.stroke();
                        }
                    }

                    panelsOnRoof.forEach((p) => {
                        const pxX = startX + p.x * scale; const pxY = startY + p.y * scale;
                        const pxW = p.w * scale; const pxH = p.h * scale;
                        lCtx.fillStyle = '#64748b'; lCtx.fillRect(pxX, pxY, pxW, pxH);
                        lCtx.strokeStyle = '#475569'; lCtx.lineWidth = 1; lCtx.strokeRect(pxX, pxY, pxW, pxH);
                    });
                    
                    layer.style.transform = `translateZ(${hZ}px) rotateX(${-tiltAngle}deg) translateZ(${-i}px)`;
                    topCanvas.parentNode.insertBefore(layer, topCanvas);
                }
            }
        }

        // --- 5. Tự động xếp pin ---
        function autoLayout() {
            panelsOnRoof = [];
            const size = getActivePanelSize();
            const gap = 0.05; 
            
            const cols = Math.floor(roofLength / (size.w + gap));
            const rows = Math.floor(roofWidth / (size.h + gap));
            
            const totalW = cols * size.w + (cols - 1) * gap;
            const totalH = rows * size.h + (rows - 1) * gap;
            const offsetX = (roofLength - totalW) / 2;
            const offsetY = (roofWidth - totalH) / 2;
            
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (window.externalTargetQty && panelsOnRoof.length >= window.externalTargetQty) break;
                    panelsOnRoof.push({
                        x: offsetX + c * (size.w + gap),
                        y: offsetY + r * (size.h + gap),
                        w: size.w,
                        h: size.h,
                        power: size.power
                    });
                }
            }
            draw();
            updateStats();
        }

        // --- 6. Tương tác Canvas ---
        function setupCanvasInteraction() {
            wrapper.addEventListener('mousedown', e => {
                if (e.button !== 0) return; 
                
                let hitPanel = false;
                
                if (e.target === topCanvas) {
                    const { mX, mY } = getMousePosInMeters(e);
                    
                    const frameStyle = document.getElementById('frameStyle') ? document.getElementById('frameStyle').value : '';
                    if (!scene.classList.contains('view-3d') && frameStyle === 'custom') {
                        const hitRadius = 0.2; 
                        for (let i = customBars.length - 1; i >= 0; i--) {
                            let bar = customBars[i];
                            if (bar.type === 'vertical' && Math.abs(mX - bar.pos) < hitRadius) {
                                draggingBarIndex = i;
                                topCanvas.style.cursor = 'ew-resize';
                                hitPanel = true;
                                break;
                            }
                            if (bar.type === 'horizontal' && Math.abs(mY - bar.pos) < hitRadius) {
                                draggingBarIndex = i;
                                topCanvas.style.cursor = 'ns-resize';
                                hitPanel = true;
                                break;
                            }
                        }
                    }

                    if (!hitPanel) {
                        for (let i = panelsOnRoof.length - 1; i >= 0; i--) {
                            let p = panelsOnRoof[i];
                            if (mX >= p.x && mX <= p.x + p.w && mY >= p.y && mY <= p.y + p.h) {
                                if (isWiringMode) {
                                    // Chế độ vẽ dây: Thêm panel vào currentString (lưu index cũ để tránh sai lệch mảng)
                                    // Nhưng do ta không đổi vị trí nên index không đổi.
                                    // Dùng index i
                                    if (currentString[currentString.length - 1] !== i) {
                                        currentString.push(i);
                                        draw();
                                    }
                                } else {
                                    draggingPanelIndex = panelsOnRoof.length - 1;
                                    dragOffset = { x: mX - p.x, y: mY - p.y };
                                    
                                    panelsOnRoof.push(panelsOnRoof.splice(i, 1)[0]);
                                    // Khi splice mảng panelsOnRoof, index các panel thay đổi. Ta cần update manualStrings, currentString nếu cần.
                                    // Tạm thời sẽ đơn giản hoá: Xoá manualStrings nếu đổi vị trí panel để tránh lỗi tham chiếu index
                                    manualStrings = [];
                                    currentString = [];
                                    
                                    topCanvas.style.cursor = 'grabbing';
                                    draw();
                                }
                                hitPanel = true;
                                break;
                            }
                        }
                    }
                }

                if (!hitPanel && scene.classList.contains('view-3d')) {
                    isRotatingScene = true;
                    lastMousePos = { x: e.clientX, y: e.clientY };
                    scene.style.transition = 'none';
                    wrapper.style.cursor = 'grab';
                }
            });

            window.addEventListener('mousemove', e => {
                if (isRotatingScene) {
                    const deltaX = e.clientX - lastMousePos.x;
                    const deltaY = e.clientY - lastMousePos.y;
                    
                    currentRotZ -= deltaX * 0.5;
                    currentRotX -= deltaY * 0.5;
                    
                    currentRotX = Math.max(0, Math.min(85, currentRotX)); 
                    
                    updateSceneTransform();
                    lastMousePos = { x: e.clientX, y: e.clientY };
                    return;
                }
            });

            wrapper.addEventListener('wheel', e => {
                e.preventDefault();
                const zoomSpeed = 0.05;
                if (e.deltaY < 0) currentZoom += zoomSpeed;
                else currentZoom -= zoomSpeed;
                currentZoom = Math.max(0.3, Math.min(3.0, currentZoom));
                updateSceneTransform();
            }, { passive: false });

            document.getElementById('btnZoomIn').addEventListener('click', () => {
                currentZoom = Math.min(3.0, currentZoom + 0.2);
                updateSceneTransform();
            });
            document.getElementById('btnZoomOut').addEventListener('click', () => {
                currentZoom = Math.max(0.3, currentZoom - 0.2);
                updateSceneTransform();
            });

            topCanvas.addEventListener('mousemove', e => {
                const { mX, mY } = getMousePosInMeters(e);
                if (draggingPanelIndex !== -1) {
                    let p = panelsOnRoof[draggingPanelIndex];
                    
                    let newX = mX - dragOffset.x;
                    let newY = mY - dragOffset.y;
                    
                    p.x = Math.max(0, Math.min(newX, roofLength - p.w));
                    p.y = Math.max(0, Math.min(newY, roofWidth - p.h));
                    
                    draw();
                } else if (draggingBarIndex !== -1) {
                    let bar = customBars[draggingBarIndex];
                    if (bar.type === 'vertical') {
                        bar.pos = Math.max(0, Math.min(mX, roofLength));
                    } else {
                        bar.pos = Math.max(0, Math.min(mY, roofWidth));
                    }
                    draw();
                } else {
                    const frameStyle = document.getElementById('frameStyle') ? document.getElementById('frameStyle').value : '';
                    if (!scene.classList.contains('view-3d') && frameStyle === 'custom') {
                        const hitRadius = 0.2;
                        let hoveringBar = false;
                        for (let bar of customBars) {
                            if (bar.type === 'vertical' && Math.abs(mX - bar.pos) < hitRadius) {
                                topCanvas.style.cursor = 'ew-resize';
                                hoveringBar = true; break;
                            }
                            if (bar.type === 'horizontal' && Math.abs(mY - bar.pos) < hitRadius) {
                                topCanvas.style.cursor = 'ns-resize';
                                hoveringBar = true; break;
                            }
                        }
                        if (!hoveringBar) topCanvas.style.cursor = 'default';
                    } else {
                        topCanvas.style.cursor = 'default';
                    }
                }
            });

            const stopDrag = () => {
                if (isRotatingScene) {
                    isRotatingScene = false;
                    scene.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    wrapper.style.cursor = 'default';
                }
                if (draggingPanelIndex !== -1) {
                    draggingPanelIndex = -1;
                    topCanvas.style.cursor = 'default';
                    draw();
                }
                if (draggingBarIndex !== -1) {
                    draggingBarIndex = -1;
                    topCanvas.style.cursor = 'default';
                    draw();
                }
            };
            window.addEventListener('mouseup', stopDrag);
            topCanvas.addEventListener('mouseout', (e) => {
                if (draggingPanelIndex !== -1) {
                    draggingPanelIndex = -1;
                    topCanvas.style.cursor = 'default';
                    draw();
                }
                if (draggingBarIndex !== -1) {
                    draggingBarIndex = -1;
                    topCanvas.style.cursor = 'default';
                    draw();
                }
            });

            topCanvas.addEventListener('contextmenu', e => {
                e.preventDefault();
                
                if (isWiringMode) {
                    if (currentString.length > 0) {
                        manualStrings.push([...currentString]);
                        currentString = [];
                        draw();
                    }
                    return;
                }
                
                const { mX, mY } = getMousePosInMeters(e);

                const frameStyle = document.getElementById('frameStyle') ? document.getElementById('frameStyle').value : '';
                if (!scene.classList.contains('view-3d') && frameStyle === 'custom') {
                    const hitRadius = 0.2;
                    for (let i = customBars.length - 1; i >= 0; i--) {
                        let bar = customBars[i];
                        if (bar.type === 'vertical' && Math.abs(mX - bar.pos) < hitRadius) {
                            customBars.splice(i, 1);
                            draw();
                            return; 
                        }
                        if (bar.type === 'horizontal' && Math.abs(mY - bar.pos) < hitRadius) {
                            customBars.splice(i, 1);
                            draw();
                            return;
                        }
                    }
                }

                for (let i = panelsOnRoof.length - 1; i >= 0; i--) {
                    let p = panelsOnRoof[i];
                    if (mX >= p.x && mX <= p.x + p.w && mY >= p.y && mY <= p.y + p.h) {
                        panelsOnRoof.splice(i, 1);
                        manualStrings = []; // Xoá dây nếu xoá panel để tránh lỗi index
                        currentString = [];
                        draw();
                        updateStats();
                        break;
                    }
                }
            });
        }

        // --- 7. Kéo thả vào Canvas ---
        function setupDragAndDrop() {
            const dragSource = document.getElementById('dragSource');
            
            dragSource.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', 'panel');
                e.dataTransfer.effectAllowed = 'copy';
            });

            topCanvas.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            });

            topCanvas.addEventListener('drop', e => {
                e.preventDefault();
                const { mX, mY } = getMousePosInMeters(e);
                const size = getActivePanelSize();
                
                let pX = mX - size.w / 2;
                let pY = mY - size.h / 2;

                if (pX >= -size.w/2 && pY >= -size.h/2 && pX <= roofLength && pY <= roofWidth) {
                    pX = Math.max(0, Math.min(pX, roofLength - size.w));
                    pY = Math.max(0, Math.min(pY, roofWidth - size.h));

                    panelsOnRoof.push({
                        x: pX,
                        y: pY,
                        w: size.w,
                        h: size.h,
                        power: size.power
                    });
                    draw();
                    updateStats();
                }
            });
        }

        function getMousePosInMeters(e) {
            let mouseX = e.offsetX;
            let mouseY = e.offsetY;
            
            if(e.target !== topCanvas) {
                const rect = topCanvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            }
            
            const roofPxW = roofLength * scale;
            const roofPxH = roofWidth * scale;
            const startX = (topCanvas.width - roofPxW) / 2;
            const startY = (topCanvas.height - roofPxH) / 2;
            
            const mX = (mouseX - startX) / scale;
            const mY = (mouseY - startY) / scale;
            return { mX, mY };
        }

        // --- 8. Tính toán thông số ---
        function updateStats() {
            const manualQty = document.getElementById('manualPanelQty').value;
            const numPanels = manualQty ? parseInt(manualQty) : panelsOnRoof.length;
            
            let totalWp = 0;
            if (manualQty) {
                const pTypeStr = document.getElementById('panelType').value;
                const pTypeObj = panels.find(p => p.id === pTypeStr);
                totalWp = numPanels * (pTypeObj ? pTypeObj.power : 0);
            } else {
                totalWp = panelsOnRoof.reduce((sum, p) => sum + p.power, 0);
            }
            const totalKWp = totalWp / 1000;
            
            document.getElementById('statPanels').innerText = numPanels;
            document.getElementById('statCapacity').innerHTML = totalKWp.toFixed(2) + ' <small>kWp</small>';
        }

        // --- 9. Logic Xuất PDF ---
        document.getElementById('btnOpenExportModal').addEventListener('click', async () => {
            document.getElementById('exportModal').classList.add('active');
            await renderPreviewHTML();
            updatePreviewScale();
        });
        
        // Cập nhật real-time preview khi gõ text
        document.getElementById('custName').addEventListener('input', e => {
            const val = e.target.value || 'Khách hàng ẩn danh';
            const el = document.getElementById('prevCustName');
            if (el) el.innerHTML = `<b>Kính gửi Khách hàng:</b> ${val}`;
            document.querySelectorAll('.tb-val-name').forEach(n => n.innerText = val);
        });
        document.getElementById('custPhone').addEventListener('input', e => {
            const el = document.getElementById('prevCustPhone');
            if (el) el.innerHTML = `<b>Số điện thoại:</b> ${e.target.value || '---'}`;
        });
        document.getElementById('custAddress').addEventListener('input', e => {
            const val = e.target.value || '---';
            const el = document.getElementById('prevCustAddress');
            if (el) el.innerHTML = `<b>Địa chỉ lắp đặt:</b> ${val}`;
            document.querySelectorAll('.tb-val-address').forEach(n => n.innerText = val);
        });
        
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            document.getElementById('exportModal').classList.remove('active');
        });
        
        function updatePreviewScale() {
            const col = document.getElementById('previewScrollArea');
            const container = document.getElementById('pdfContainer');
            if(col && container) {
                const availableWidth = col.clientWidth - 40; 
                const scale = availableWidth < 794 ? availableWidth / 794 : 1;
                container.style.transform = `scale(${scale})`;
                container.style.marginBottom = `${-(1-scale)*container.clientHeight}px`; // Fix height after scaling
            }
        }
        window.addEventListener('resize', updatePreviewScale);
        
        document.getElementById('btnExportPDF').addEventListener('click', () => {
    // NATIVE PRINT (100% Reliable, Zero Hangs)
    const container = document.getElementById('pdfContainer');
    const originalTransform = container.style.transform;
    container.style.transform = 'none';
    
    const originalTitle = document.title;
    const custName = document.getElementById('custName').value || 'Khach_hang';
    document.title = `Bao_Cao_Solar_XBSolar_${custName.replace(/\s+/g, '_')}`;
    
    try {
        window.print();
    } catch (e) {
        console.error("Lỗi khi in PDF:", e);
        alert("Không thể mở hộp thoại in. Vui lòng thử lại!");
    } finally {
        document.title = originalTitle;
        container.style.transform = originalTransform;
    }
});

        function generateWiringDiagramSVG(inverters, phase, totalKWp, custName, stringCounts, panelModel, panelPower) {
            const is3Phase = phase === "3";
            const inverterQty = inverters.length;
            let stringIndex = 0;

            const svgW = Math.max(1200, inverterQty * 400 + 400);
            const svgH = 1200;
            
            // SLD Standard Colors
            const colorL = "#dc2626"; // Red for Positive / Line
            const colorN = "#2563eb"; // Blue for Negative / Neutral
            const colorPE = "#16a34a"; // Green for PE
            
            const strokeW = 2; // Main line width
            const thickW = 4; // Busbar width

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" preserveAspectRatio="xMidYMid meet" style="background: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">`;
            
            // Khung bản vẽ & Tiêu đề
            svg += `<rect x="10" y="10" width="${svgW - 20}" height="${svgH - 20}" fill="none" stroke="#333" stroke-width="2"/>`;
            svg += `<rect x="10" y="10" width="${svgW - 20}" height="60" fill="#f8fafc" stroke="#333" stroke-width="2"/>`;
            svg += `<text x="${svgW/2}" y="48" font-size="22" font-weight="bold" fill="#1e293b" text-anchor="middle">SƠ ĐỒ NGUYÊN LÝ HỆ THỐNG ĐIỆN MẶT TRỜI ${totalKWp}kWp - ${phase} PHA</text>`;

            // --- KHU VỰC CHIA CỘT CHO INVERTERS ---
            const invAreaW = svgW - 400; // Left side for Inverters
            const colW = invAreaW / inverterQty;
            
            const pvY = 130;
            const invY = 380;
            const acPanelY = 650;
            
            // Draw Inverters & PVs
            for (let i = 0; i < inverterQty; i++) {
                const invConf = inverters[i];
                const numStrings = invConf.numStrings || 1;
                const cx = 20 + i * colW + colW/2;
                
                // --- Vẽ PV Strings ---
                const pvGap = 40;
                let stringConfigs = [];
                let totalPvW = 0;
                
                // Tính toán thông số từng String
                for (let j = 0; j < numStrings; j++) {
                    const count = (stringCounts && stringCounts[stringIndex + j]) ? stringCounts[stringIndex + j] : 0;
                    let cols = count > 8 ? Math.ceil(count / Math.ceil(count / 8)) : count;
                    if (count === 0) cols = 1;
                    let rows = Math.ceil(count / cols);
                    if (count === 0) rows = 1;

                    const pW = 16, pH = 28, pGapX = 6, pGapY = 8;
                    let sW = cols * (pW + pGapX) - pGapX;
                    let sH = rows * (pH + pGapY) - pGapY;
                    
                    if (count === 0) { sW = 60; sH = 80; }
                    sW = Math.max(sW, 80); // Min width

                    stringConfigs.push({ count, cols, rows, sW, sH, pW, pH, pGapX, pGapY });
                    totalPvW += sW;
                }
                totalPvW += (numStrings - 1) * pvGap;
                let currentPvX = cx - totalPvW / 2;
                
                const maxPvBoxH = Math.max(...stringConfigs.map(sc => sc.sH), 80);
                const cbY = pvY + maxPvBoxH + 40;
                
                for (let j = 0; j < numStrings; j++) {
                    const sc = stringConfigs[j];
                    const stringX = currentPvX + sc.sW / 2;
                    const pvBoxW = sc.sW;
                    const pvBoxH = sc.sH;
                    
                    const count = sc.count;
                    stringIndex++;
                    const stKWp = (count * panelPower / 1000).toFixed(2);
                    const shortModel = panelModel.length > 15 ? panelModel.substring(0, 15) + '...' : panelModel;
                    
                    let pvDraw = "";
                    if (count > 0) {
                        for(let r = 0; r < sc.rows; r++) {
                            const y = r * (sc.pH + sc.pGapY);
                            const panelsInRow = (r === sc.rows - 1) ? (sc.count - r * sc.cols) : sc.cols;
                            const rowW = panelsInRow * (sc.pW + sc.pGapX) - sc.pGapX;
                            const lineY = y + sc.pH/2;
                            
                            pvDraw += `<line x1="0" y1="${lineY}" x2="${rowW}" y2="${lineY}" stroke="#475569" stroke-width="2"/>`;
                            
                            if (r < sc.rows - 1) {
                                if (r % 2 === 0) {
                                    const nextPanels = (r+1 === sc.rows - 1) ? (sc.count - (r+1) * sc.cols) : sc.cols;
                                    const nextRowW = nextPanels * (sc.pW + sc.pGapX) - sc.pGapX;
                                    pvDraw += `<polyline points="${rowW},${lineY} ${rowW+8},${lineY} ${rowW+8},${lineY + sc.pH + sc.pGapY} ${nextRowW},${lineY + sc.pH + sc.pGapY}" fill="none" stroke="#475569" stroke-width="2"/>`;
                                } else {
                                    pvDraw += `<polyline points="0,${lineY} -8,${lineY} -8,${lineY + sc.pH + sc.pGapY} 0,${lineY + sc.pH + sc.pGapY}" fill="none" stroke="#475569" stroke-width="2"/>`;
                                }
                            }
                            
                            for(let c = 0; c < panelsInRow; c++) {
                                const px = c * (sc.pW + sc.pGapX);
                                pvDraw += `
                                    <rect x="${px}" y="${y}" width="${sc.pW}" height="${sc.pH}" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" rx="1"/>
                                    <line x1="${px + sc.pW/2}" y1="${y}" x2="${px + sc.pW/2}" y2="${y + sc.pH}" stroke="#7dd3fc" stroke-width="0.5"/>
                                    <line x1="${px}" y1="${y + sc.pH/3}" x2="${px + sc.pW}" y2="${y + sc.pH/3}" stroke="#7dd3fc" stroke-width="0.5"/>
                                    <line x1="${px}" y1="${y + sc.pH*2/3}" x2="${px + sc.pW}" y2="${y + sc.pH*2/3}" stroke="#7dd3fc" stroke-width="0.5"/>
                                `;
                            }
                        }
                    } else {
                        pvDraw = `
                            <rect x="0" y="0" width="${pvBoxW}" height="${pvBoxH}" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
                            <line x1="0" y1="${pvBoxH}" x2="${pvBoxW}" y2="0" stroke="#334155" stroke-width="1"/>
                            <rect x="5" y="5" width="${pvBoxW/2 - 10}" height="${pvBoxH/2 - 10}" fill="none" stroke="#94a3b8"/>
                            <rect x="${pvBoxW/2 + 5}" y="${pvBoxH/2 + 5}" width="${pvBoxW/2 - 10}" height="${pvBoxH/2 - 10}" fill="none" stroke="#94a3b8"/>
                        `;
                    }
                    
                    const actualW = count > 0 ? (sc.cols * (sc.pW + sc.pGapX) - sc.pGapX) : pvBoxW;
                    const shiftX = (pvBoxW - actualW) / 2;
                    
                    svg += `
                        <g transform="translate(${stringX - pvBoxW/2}, ${pvY})">
                            <text x="${pvBoxW/2}" y="-40" font-size="14" font-weight="bold" fill="#1e293b" text-anchor="middle">String ${j+1}</text>
                            <text x="${pvBoxW/2}" y="-22" font-size="11" fill="#475569" text-anchor="middle">${count > 0 ? count + ' Tấm x ' + shortModel : 'String ' + (j+1)}</text>
                            <text x="${pvBoxW/2}" y="-8" font-size="11" font-weight="bold" fill="#16a34a" text-anchor="middle">${count > 0 ? stKWp + ' kWp' : ''}</text>
                            <g transform="translate(${shiftX}, 0)">
                                ${pvDraw}
                            </g>
                        </g>
                    `;
                    
                    // Dây DC
                    const wireLx = stringX - 10;
                    const wireRx = stringX + 10;
                    
                    if (count > 0) {
                        const startX = stringX - pvBoxW/2 + shiftX;
                        const startY = pvY + sc.pH/2;
                        
                        const lastRowPanels = (sc.rows - 1 === sc.rows - 1) ? (sc.count - (sc.rows - 1) * sc.cols) : sc.cols;
                        const lastRowW = lastRowPanels * (sc.pW + sc.pGapX) - sc.pGapX;
                        const endX = startX + ((sc.rows - 1) % 2 === 0 ? lastRowW : 0);
                        const endY = pvY + (sc.rows - 1) * (sc.pH + sc.pGapY) + sc.pH/2;
                        
                        svg += `<polyline points="${startX},${startY} ${startX - 15},${startY} ${startX - 15},${cbY - 20} ${wireLx},${cbY - 20} ${wireLx},${cbY}" fill="none" stroke="${colorL}" stroke-width="${strokeW}"/>`;
                        const endDir = (sc.rows - 1) % 2 === 0 ? 15 : -15; 
                        svg += `<polyline points="${endX},${endY} ${endX + endDir},${endY} ${endX + endDir},${cbY - 15} ${wireRx},${cbY - 15} ${wireRx},${cbY}" fill="none" stroke="${colorN}" stroke-width="${strokeW}"/>`;
                    } else {
                        svg += `<line x1="${wireLx}" y1="${pvY + pvBoxH}" x2="${wireLx}" y2="${cbY}" stroke="${colorL}" stroke-width="${strokeW}"/>`;
                        svg += `<line x1="${wireRx}" y1="${pvY + pvBoxH}" x2="${wireRx}" y2="${cbY}" stroke="${colorN}" stroke-width="${strokeW}"/>`;
                    }
                    
                    // CB DC
                    svg += `
                        <rect x="${stringX - 25}" y="${cbY}" width="50" height="30" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                        <line x1="${wireLx - 5}" y1="${cbY + 15}" x2="${wireLx + 5}" y2="${cbY + 15}" stroke="${colorL}" stroke-width="2"/>
                        <line x1="${wireRx - 5}" y1="${cbY + 15}" x2="${wireRx + 5}" y2="${cbY + 15}" stroke="${colorN}" stroke-width="2"/>
                        <text x="${stringX}" y="${cbY + 45}" font-size="12" text-anchor="middle">CB DC</text>
                    `;
                    
                    // Dây xuống Inverter
                    const invDcPortLx = cx - 40 + (j * 15);
                    const invDcPortRx = cx + 40 + (j * 15);
                    
                    svg += `<path d="M ${wireLx} ${cbY + 30} L ${wireLx} ${cbY + 70} L ${invDcPortLx} ${cbY + 70} L ${invDcPortLx} ${invY}" fill="none" stroke="${colorL}" stroke-width="${strokeW}"/>`;
                    svg += `<path d="M ${wireRx} ${cbY + 30} L ${wireRx} ${cbY + 60} L ${invDcPortRx} ${cbY + 60} L ${invDcPortRx} ${invY}" fill="none" stroke="${colorN}" stroke-width="${strokeW}"/>`;
                    
                    currentPvX += sc.sW + pvGap;
                }
                
                // --- Draw Inverter ---
                const invW = 160;
                const invH = 200;
                let invDraw = '';
                if (window.customImages && window.customImages.inverter) {
                    invDraw = `<image href="${window.customImages.inverter}" x="0" y="0" width="${invW}" height="${invH}" preserveAspectRatio="xMidYMid meet" />`;
                } else if (invConf.autoImg) {
                    invDraw = `<image href="${invConf.autoImg}" x="0" y="0" width="${invW}" height="${invH}" preserveAspectRatio="xMidYMid meet" />`;
                } else {
                    invDraw = `
                        <rect x="0" y="0" width="${invW}" height="${invH}" fill="#ffffff" stroke="#1e293b" stroke-width="3" rx="8"/>
                        <line x1="0" y1="0" x2="${invW}" y2="${invH}" stroke="#e2e8f0" stroke-width="1"/>
                        <text x="30" y="40" font-size="20" font-weight="bold" fill="#1e293b">=</text>
                        <text x="${invW - 30}" y="${invH - 30}" font-size="20" font-weight="bold" fill="#1e293b">~</text>
                        <rect x="10" y="70" width="${invW - 20}" height="60" fill="#f8fafc" stroke="#cbd5e1" rx="4"/>
                        <text x="${invW/2}" y="100" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">${invConf.model.length > 20 ? invConf.model.substring(0, 17) + "..." : invConf.model}</text>
                        <text x="${invW/2}" y="120" font-size="12" fill="#64748b" text-anchor="middle">${invConf.type.toUpperCase()} INV.</text>
                    `;
                }
                
                svg += `
                    <g transform="translate(${cx - invW/2}, ${invY})">
                        ${invDraw}
                    </g>
                `;
                
                // --- Draw Battery ---
                if (invConf.batteryModel && invConf.batteryModel !== 'none') {
                    const batX = cx + invW/2 + 40;
                    const batY = invY + 40;
                    let batDraw = '';
                    if (window.customImages && window.customImages.battery) {
                        batDraw = `<image href="${window.customImages.battery}" x="0" y="0" width="140" height="200" preserveAspectRatio="xMidYMid meet" />`;
                    } else if (invConf.autoBatImg) {
                        batDraw = `<image href="${invConf.autoBatImg}" x="0" y="0" width="140" height="200" preserveAspectRatio="xMidYMid meet" />`;
                    } else {
                        batDraw = `
                            <rect x="0" y="0" width="140" height="200" fill="#f8fafc" stroke="#334155" stroke-width="2" rx="8"/>
                            <line x1="30" y1="50" x2="110" y2="50" stroke="#1e293b" stroke-width="3"/>
                            <line x1="50" y1="70" x2="90" y2="70" stroke="#1e293b" stroke-width="6"/>
                            <line x1="30" y1="90" x2="110" y2="90" stroke="#1e293b" stroke-width="3"/>
                            <line x1="50" y1="110" x2="90" y2="110" stroke="#1e293b" stroke-width="6"/>
                            
                            <text x="70" y="160" font-size="16" font-weight="bold" text-anchor="middle">${invConf.batteryModel.split(' ')[0]}</text>
                            <text x="70" y="180" font-size="12" text-anchor="middle">LITHIUM</text>
                        `;
                    }
                    svg += `
                        <path d="M ${batX + 70} ${batY + 140} L ${cx + invW/2} ${batY + 140}" fill="none" stroke="${colorL}" stroke-width="${strokeW}"/>
                        <path d="M ${batX + 70} ${batY + 160} L ${cx + invW/2} ${batY + 160}" fill="none" stroke="${colorN}" stroke-width="${strokeW}"/>
                        <rect x="${batX - 25}" y="${batY + 130}" width="15" height="40" fill="#ffffff" stroke="#1e293b" stroke-width="1"/>
                        <text x="${batX - 18}" y="${batY + 125}" font-size="10" text-anchor="middle">CB</text>
                        <g transform="translate(${batX}, ${batY})">
                            ${batDraw}
                        </g>
                    `;
                }
                
                // --- Inverter AC Output ---
                const acOutX = cx;
                const acOutY = invY + invH;
                svg += `
                    <path d="M ${acOutX} ${acOutY} L ${acOutX} ${acPanelY + 30}" fill="none" stroke="#1e293b" stroke-width="3"/>
                    <line x1="${acOutX - 5}" y1="${acOutY + 20}" x2="${acOutX + 5}" y2="${acOutY + 15}" stroke="#1e293b" stroke-width="2"/>
                    <line x1="${acOutX - 5}" y1="${acOutY + 25}" x2="${acOutX + 5}" y2="${acOutY + 20}" stroke="#1e293b" stroke-width="2"/>
                    ${is3Phase ? `<line x1="${acOutX - 5}" y1="${acOutY + 30}" x2="${acOutX + 5}" y2="${acOutY + 25}" stroke="#1e293b" stroke-width="2"/>` : ''}
                    <text x="${acOutX + 15}" y="${acOutY + 25}" font-size="12">${is3Phase ? '3P4W' : '1P3W'}</text>
                `;
            }
            
            // --- TỦ ĐIỆN AC TỔNG ---
            const panelW = Math.max(900, svgW - 100);
            const panelH = 260;
            const panelX = 50;
            
            svg += `
                <rect x="${panelX}" y="${acPanelY}" width="${panelW}" height="${panelH}" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8,4" rx="8"/>
                <text x="${panelX + 20}" y="${acPanelY + 30}" font-size="16" font-weight="bold" fill="#334155">TỦ ĐIỆN PHÂN PHỐI AC (AC DB)</text>
            `;
            
            const busL_Y = acPanelY + 80;
            const busN_Y = acPanelY + 120;
            const busPE_Y = acPanelY + 200;
            
            svg += `
                <line x1="${panelX + 20}" y1="${busL_Y}" x2="${panelX + panelW - 20}" y2="${busL_Y}" stroke="${colorL}" stroke-width="${thickW}"/>
                <text x="${panelX + panelW - 10}" y="${busL_Y - 5}" font-size="14" font-weight="bold" fill="${colorL}" text-anchor="end">BUSBAR L ${is3Phase? '(L1, L2, L3)' : ''}</text>
                
                <line x1="${panelX + 20}" y1="${busN_Y}" x2="${panelX + panelW - 20}" y2="${busN_Y}" stroke="${colorN}" stroke-width="${thickW}"/>
                <text x="${panelX + panelW - 10}" y="${busN_Y - 5}" font-size="14" font-weight="bold" fill="${colorN}" text-anchor="end">BUSBAR N</text>
                
                <line x1="${panelX + 20}" y1="${busPE_Y}" x2="${panelX + panelW - 20}" y2="${busPE_Y}" stroke="${colorPE}" stroke-width="${thickW}"/>
                <text x="${panelX + panelW - 10}" y="${busPE_Y - 5}" font-size="14" font-weight="bold" fill="${colorPE}" text-anchor="end">PE</text>
            `;
            
            for (let i = 0; i < inverterQty; i++) {
                const cx = 20 + i * colW + colW/2;
                const dropY = acPanelY + 30;
                
                svg += `
                    <rect x="${cx - 15}" y="${dropY}" width="30" height="20" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                    <path d="M ${cx - 10} ${dropY + 20} Q ${cx} ${dropY + 10} ${cx + 10} ${dropY + 20}" fill="none" stroke="#1e293b" stroke-width="2"/>
                    <text x="${cx + 25}" y="${dropY + 15}" font-size="12">CB INV ${i+1}</text>
                    
                    <line x1="${cx}" y1="${dropY + 20}" x2="${cx}" y2="${busL_Y}" stroke="#1e293b" stroke-width="2"/>
                    <circle cx="${cx}" cy="${busL_Y}" r="4" fill="${colorL}"/>
                    
                    <line x1="${cx + 10}" y1="${dropY + 20}" x2="${cx + 10}" y2="${busN_Y}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2,2"/>
                    <circle cx="${cx + 10}" cy="${busN_Y}" r="4" fill="${colorN}"/>
                    
                    <line x1="${cx + 60}" y1="${invY + 200}" x2="${cx + 60}" y2="${busPE_Y}" stroke="${colorPE}" stroke-width="1" stroke-dasharray="4,2"/>
                    <circle cx="${cx + 60}" cy="${busPE_Y}" r="4" fill="${colorPE}"/>
                `;
            }
            
            const spdX = panelX + panelW - 350;
            svg += `
                <rect x="${spdX}" y="${busL_Y + 20}" width="40" height="40" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
                <polygon points="${spdX + 20},${busL_Y + 30} ${spdX + 15},${busL_Y + 40} ${spdX + 25},${busL_Y + 40} ${spdX + 20},${busL_Y + 50}" fill="#dc2626"/>
                <text x="${spdX + 20}" y="${busL_Y + 75}" font-size="12" font-weight="bold" text-anchor="middle">AC SPD</text>
                
                <line x1="${spdX + 10}" y1="${busL_Y}" x2="${spdX + 10}" y2="${busL_Y + 20}" stroke="${colorL}" stroke-width="2"/>
                <line x1="${spdX + 30}" y1="${busN_Y}" x2="${spdX + 30}" y2="${busL_Y + 20}" stroke="${colorN}" stroke-width="2"/>
                <line x1="${spdX + 20}" y1="${busL_Y + 60}" x2="${spdX + 20}" y2="${busPE_Y}" stroke="${colorPE}" stroke-width="2"/>
                <circle cx="${spdX + 10}" cy="${busL_Y}" r="4" fill="${colorL}"/>
                <circle cx="${spdX + 30}" cy="${busN_Y}" r="4" fill="${colorN}"/>
                <circle cx="${spdX + 20}" cy="${busPE_Y}" r="4" fill="${colorPE}"/>
            `;
            
            const gridOutX = panelX + panelW - 220;
            const loadOutX = panelX + panelW - 80;
            
            svg += `
                <line x1="${gridOutX}" y1="${busL_Y}" x2="${gridOutX}" y2="${busL_Y - 30}" stroke="#1e293b" stroke-width="2"/>
                <circle cx="${gridOutX}" cy="${busL_Y}" r="4" fill="${colorL}"/>
                <rect x="${gridOutX - 15}" y="${busL_Y - 50}" width="30" height="20" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                <path d="M ${gridOutX - 10} ${busL_Y - 50} Q ${gridOutX} ${busL_Y - 40} ${gridOutX + 10} ${busL_Y - 50}" fill="none" stroke="#1e293b" stroke-width="2"/>
                <text x="${gridOutX + 20}" y="${busL_Y - 35}" font-size="12" font-weight="bold">CB GRID</text>
                <line x1="${gridOutX}" y1="${busL_Y - 50}" x2="${gridOutX}" y2="${busL_Y - 150}" stroke="#1e293b" stroke-width="3"/>
            `;
            
            const meterY = busL_Y - 190;
            svg += `
                <rect x="${gridOutX - 25}" y="${meterY}" width="50" height="40" fill="#f8fafc" stroke="#1e293b" stroke-width="2" rx="4"/>
                <text x="${gridOutX}" y="${meterY + 20}" font-size="12" font-weight="bold" text-anchor="middle">kWh</text>
                <text x="${gridOutX}" y="${meterY + 32}" font-size="10" text-anchor="middle">METER</text>
                <line x1="${gridOutX}" y1="${meterY}" x2="${gridOutX}" y2="${meterY - 100}" stroke="#1e293b" stroke-width="3"/>
            `;
            
            const poleY = meterY - 120;
            svg += `
                <circle cx="${gridOutX}" cy="${poleY}" r="15" fill="none" stroke="#1e293b" stroke-width="2"/>
                <path d="M ${gridOutX - 10} ${poleY + 5} Q ${gridOutX} ${poleY - 5} ${gridOutX + 10} ${poleY + 5}" fill="none" stroke="#1e293b" stroke-width="2"/>
                <text x="${gridOutX}" y="${poleY - 25}" font-size="16" font-weight="bold" text-anchor="middle">LƯỚI ĐIỆN (EVN)</text>
            `;

            svg += `
                <line x1="${loadOutX}" y1="${busL_Y}" x2="${loadOutX}" y2="${acPanelY + panelH + 20}" stroke="#1e293b" stroke-width="2"/>
                <circle cx="${loadOutX}" cy="${busL_Y}" r="4" fill="${colorL}"/>
                <rect x="${loadOutX - 15}" y="${acPanelY + panelH + 20}" width="30" height="20" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
                <path d="M ${loadOutX - 10} ${acPanelY + panelH + 20} Q ${loadOutX} ${acPanelY + panelH + 30} ${loadOutX + 10} ${acPanelY + panelH + 20}" fill="none" stroke="#1e293b" stroke-width="2"/>
                <text x="${loadOutX + 25}" y="${acPanelY + panelH + 35}" font-size="12" font-weight="bold">CB TẢI</text>
                <line x1="${loadOutX}" y1="${acPanelY + panelH + 40}" x2="${loadOutX}" y2="${acPanelY + panelH + 100}" stroke="#1e293b" stroke-width="3"/>
            `;
            
            const loadY = acPanelY + panelH + 100;
            svg += `
                <polygon points="${loadOutX},${loadY} ${loadOutX - 20},${loadY + 20} ${loadOutX + 20},${loadY + 20}" fill="#3b82f6"/>
                <rect x="${loadOutX - 15}" y="${loadY + 20}" width="30" height="20" fill="#94a3b8"/>
                <text x="${loadOutX}" y="${loadY + 60}" font-size="16" font-weight="bold" text-anchor="middle">TẢI TIÊU THỤ</text>
            `;

            const earthX = panelX + panelW - 40;
            svg += `
                <line x1="${earthX}" y1="${busPE_Y}" x2="${earthX}" y2="${busPE_Y + 40}" stroke="${colorPE}" stroke-width="${thickW}"/>
                <line x1="${earthX - 15}" y1="${busPE_Y + 40}" x2="${earthX + 15}" y2="${busPE_Y + 40}" stroke="${colorPE}" stroke-width="3"/>
                <line x1="${earthX - 10}" y1="${busPE_Y + 45}" x2="${earthX + 10}" y2="${busPE_Y + 45}" stroke="${colorPE}" stroke-width="3"/>
                <line x1="${earthX - 5}" y1="${busPE_Y + 50}" x2="${earthX + 5}" y2="${busPE_Y + 50}" stroke="${colorPE}" stroke-width="3"/>
            `;

            const legX = 50;
            const legY = acPanelY + panelH + 40;
            svg += `
                <rect x="${legX}" y="${legY}" width="280" height="150" fill="#ffffff" stroke="#94a3b8" stroke-width="2" rx="4"/>
                <text x="${legX + 10}" y="${legY + 25}" font-size="14" font-weight="bold" fill="#1e293b">CHÚ THÍCH KÝ HIỆU (LEGEND)</text>
                
                <rect x="${legX + 15}" y="${legY + 45}" width="20" height="12" fill="none" stroke="#1e293b" stroke-width="1.5"/>
                <path d="M ${legX + 17} ${legY + 57} Q ${legX + 25} ${legY + 50} ${legX + 33} ${legY + 57}" fill="none" stroke="#1e293b" stroke-width="1.5"/>
                <text x="${legX + 45}" y="${legY + 55}" font-size="12">Circuit Breaker (Aptomat)</text>
                
                <rect x="${legX + 15}" y="${legY + 70}" width="20" height="20" fill="none" stroke="#1e293b" stroke-width="1.5"/>
                <polygon points="${legX+25},${legY+75} ${legX+22},${legY+80} ${legX+27},${legY+80} ${legX+25},${legY+85}" fill="#dc2626"/>
                <text x="${legX + 45}" y="${legY + 85}" font-size="12">Surge Protection Device (Chống sét)</text>
                
                <line x1="${legX + 15}" y1="${legY + 110}" x2="${legX + 35}" y2="${legY + 110}" stroke="${colorL}" stroke-width="2"/>
                <text x="${legX + 45}" y="${legY + 114}" font-size="12">Dây Pha (L) / Dương DC (+)</text>
                
                <line x1="${legX + 15}" y1="${legY + 130}" x2="${legX + 35}" y2="${legY + 130}" stroke="${colorN}" stroke-width="2"/>
                <text x="${legX + 45}" y="${legY + 134}" font-size="12">Trung tính (N) / Âm DC (-)</text>
            `;

            svg += `</svg>`;
            return svg;
        }

        async function renderPreviewHTML() {
            const loading = document.getElementById('pdfLoading');
            loading.style.display = 'flex';
            
            // Lấy thông tin KH ban đầu
            const custName = document.getElementById('custName').value || 'Khách hàng ẩn danh';
            const custPhone = document.getElementById('custPhone').value || '---';
            const custAddress = document.getElementById('custAddress').value || '---';
            const today = new Date().toLocaleDateString('vi-VN');
            
            // Tính toán tổng quan
            const manualQty = document.getElementById('manualPanelQty').value;
            const finalPanelCount = manualQty ? parseInt(manualQty) : panelsOnRoof.length;
            
            let totalWp = 0;
            if (manualQty) {
                const pTypeStr = document.getElementById('panelType').value;
                const pTypeObj = panels.find(p => p.id === pTypeStr);
                totalWp = finalPanelCount * (pTypeObj ? pTypeObj.power : 0);
            } else {
                totalWp = panelsOnRoof.reduce((sum, p) => sum + p.power, 0);
            }
            const totalKWp = (totalWp / 1000).toFixed(2);
            
            const monthlyEnergyText = Math.round(totalKWp * 4.3 * 30 * 0.8).toLocaleString('vi-VN') + ' kWh';
            const gridPhase = document.getElementById('gridPhase').value;
            
            // Tự động tìm kiếm ảnh thực tế từ tên model (nếu có trên host)
            async function fetchImageAsBase64(url) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) return null;
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    return null;
                }
            }

            for (let i = 0; i < invertersConfig.length; i++) {
                if (!invertersConfig[i].autoImg) {
                    invertersConfig[i].autoImg = await fetchImageAsBase64('Inverter ' + invertersConfig[i].model + '.png');
                }
                if (invertersConfig[i].batteryModel && invertersConfig[i].batteryModel !== 'none') {
                    if (!invertersConfig[i].autoBatImg) {
                        invertersConfig[i].autoBatImg = await fetchImageAsBase64('Pin ' + invertersConfig[i].batteryModel + '.png');
                    }
                }
            }

            // SVG 3: Sơ đồ nối dây (SLD)
            let projectName = `HỆ THỐNG ĐIỆN NLMT CÔNG SUẤT ${totalKWp}kWp`;
            
            const inverterQty = invertersConfig.length;
            const inverterModel = Array.from(new Set(invertersConfig.map(i => i.model))).join(' & ');
            const validBatteries = invertersConfig.filter(i => i.batteryModel !== 'none').map(i => i.batteryModel);
            const batteryModel = validBatteries.length > 0 ? Array.from(new Set(validBatteries)).join(' & ') : 'none';
            const batteryQty = validBatteries.length;
            
            // Tìm xem có cấu hình battery nào không
            const hasBattery = validBatteries.length > 0;
            if (hasBattery) {
                let totalCap = 0;
                invertersConfig.forEach(i => {
                    if (i.batteryModel !== 'none') {
                        const kwhMatch = i.batteryModel.match(/(d+(.d+)?)s*kWh/i);
                        if (kwhMatch) totalCap += parseFloat(kwhMatch[1]);
                    }
                });
                if (totalCap > 0) {
                    projectName += ` - LƯU TRỮ ${totalCap}KWH`;
                } else {
                    projectName += ` - CÓ LƯU TRỮ`;
                }
            }
            
            const manualQtyStr = document.getElementById('manualPanelQty').value;
            let panelTypeStr = '';
            let panelPower = 0;
            if (manualQtyStr) {
                const sel = document.getElementById('panelType');
                panelTypeStr = sel.options[sel.selectedIndex].text.replace(/\s*-\s*.*$/, ''); // Rút gọn tên
                const pTypeObj = panels.find(p => p.id === sel.value);
                panelPower = pTypeObj ? pTypeObj.power : 0;
            } else {
                if (panelsOnRoof.length > 0) {
                     const pTypeObj = panels.find(p => p.power === panelsOnRoof[0].power);
                     panelTypeStr = pTypeObj ? pTypeObj.name.replace(/\s*-\s*.*$/, '') : `${panelsOnRoof[0].power}W`;
                     panelPower = panelsOnRoof[0].power;
                }
            }

            const totalNumStrings = invertersConfig.reduce((sum, inv) => sum + (inv.numStrings || 1), 0);
            let stringCounts = [];
            if (manualStrings.length > 0) {
                stringCounts = manualStrings.map(arr => arr.length);
            } else {
                const baseCount = Math.floor(finalPanelCount / totalNumStrings);
                let remainder = finalPanelCount % totalNumStrings;
                for (let i = 0; i < totalNumStrings; i++) {
                    stringCounts.push(baseCount + (remainder > 0 ? 1 : 0));
                    remainder--;
                }
            }

            const diagramSVG = generateWiringDiagramSVG(invertersConfig, gridPhase, totalKWp, custName, stringCounts, panelTypeStr, panelPower);
            
            const installType = document.getElementById('installType').options[document.getElementById('installType').selectedIndex].text;
            
            // Hàm tiện ích để cắt bớt viền trắng của canvas
            function cropCanvas(sourceCanvas, padding = 20) {
                const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
                const w = sourceCanvas.width, h = sourceCanvas.height;
                const imageData = ctx.getImageData(0, 0, w, h);
                const data = imageData.data;
                let minX = w, minY = h, maxX = 0, maxY = 0;
                let hasContent = false;
                
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const i = (y * w + x) * 4;
                        const r = data[i], g = data[i+1], b = data[i+2];
                        if (r < 250 || g < 250 || b < 250) { // Không phải trắng tinh
                            if (x < minX) minX = x;
                            if (y < minY) minY = y;
                            if (x > maxX) maxX = x;
                            if (y > maxY) maxY = y;
                            hasContent = true;
                        }
                    }
                }
                
                if (!hasContent) return sourceCanvas;
                
                minX = Math.max(0, minX - padding);
                minY = Math.max(0, minY - padding);
                maxX = Math.min(w, maxX + padding);
                maxY = Math.min(h, maxY + padding);
                
                const newW = maxX - minX, newH = maxY - minY;
                const cropped = document.createElement('canvas');
                cropped.width = newW;
                cropped.height = newH;
                const cctx = cropped.getContext('2d');
                cctx.fillStyle = 'white';
                cctx.fillRect(0, 0, newW, newH);
                cctx.drawImage(sourceCanvas, minX, minY, newW, newH, 0, 0, newW, newH);
                return cropped;
            }

            // 1. Chụp ảnh 3D bằng html-to-image để giữ nguyên hiệu ứng Perspective CSS
            const sceneEl = document.getElementById('scene');
            const was3D = sceneEl.classList.contains('view-3d');
            
            if (!was3D) {
                sceneEl.classList.add('view-3d');
                updateSceneTransform();
                draw(); // Redraw if needed
            }
            // Đợi CSS transition 3D hoàn tất
            await new Promise(r => setTimeout(r, 400));
            
            const fallbackBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            let img3D = fallbackBase64;
            try {
                // Chụp chính xác DOM element với mọi CSS transforms
                const dataUrl3D = await Promise.race([
                    htmlToImage.toJpeg(sceneEl, { quality: 0.95, backgroundColor: 'white', pixelRatio: 2 }),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout capturing 3D')), 5000))
                ]);
                
                // Đưa vào Image để crop lề trắng
                const imgObj3D = new Image();
                imgObj3D.src = dataUrl3D;
                await new Promise((resolve, reject) => { 
                    imgObj3D.onload = resolve; 
                    imgObj3D.onerror = reject;
                });
                
                // Tạo canvas phụ để crop
                const canvas3D = document.createElement('canvas');
                canvas3D.width = imgObj3D.width;
                canvas3D.height = imgObj3D.height;
                const ctx3D = canvas3D.getContext('2d');
                ctx3D.fillStyle = 'white';
                ctx3D.fillRect(0, 0, canvas3D.width, canvas3D.height);
                ctx3D.drawImage(imgObj3D, 0, 0);
                
                const finalCanvas3D = cropCanvas(canvas3D, 20);
                img3D = finalCanvas3D.toDataURL('image/jpeg', 0.9);
            } catch (err) {
                console.error('Error capturing 3D:', err);
                img3D = fallbackBase64;
            }
            
            // 2. Chuyển về 2D để chụp mặt bằng
            sceneEl.classList.remove('view-3d');
            updateSceneTransform();
            draw();
            await new Promise(r => setTimeout(r, 400)); // Đợi transition 2D

            // Tạo ảnh cho Trang 4 (Bố trí pin 2D)
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = roofCanvas.width;
            combinedCanvas.height = roofCanvas.height;
            const ctxComb = combinedCanvas.getContext('2d');
            ctxComb.fillStyle = 'white';
            ctxComb.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
            ctxComb.drawImage(roofCanvas, 0, 0);
            ctxComb.drawImage(topCanvas, 0, 0);
            const finalLayoutCanvas = cropCanvas(combinedCanvas);
            const imgLayout = finalLayoutCanvas.toDataURL('image/jpeg', 0.9);
            
            // Tạo ảnh cho Trang 5 (Đấu nối Stringing)
            // Vẽ lại layout + vẽ thêm đường nối
            const stringCanvas = document.createElement('canvas');
            stringCanvas.width = roofCanvas.width;
            stringCanvas.height = roofCanvas.height;
            const ctxStr = stringCanvas.getContext('2d');
            ctxStr.fillStyle = 'white';
            ctxStr.fillRect(0, 0, stringCanvas.width, stringCanvas.height);
            ctxStr.drawImage(roofCanvas, 0, 0);
            ctxStr.drawImage(topCanvas, 0, 0);
            
            // Thuật toán vẽ nối (Stringing)
            if (panelsOnRoof.length > 1) {
                const roofPxW = roofLength * scale;
                const roofPxH = roofWidth * scale;
                const startX = (roofCanvas.width - roofPxW) / 2;
                const startY = (roofCanvas.height - roofPxH) / 2;
                const colors = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#ec4899', '#14b8a6'];
                
                if (manualStrings.length > 0) {
                    // DÙNG DÂY VẼ THỦ CÔNG
                    manualStrings.forEach((stringArray, i) => {
                        if (stringArray.length === 0) return;
                        
                        ctxStr.beginPath();
                        ctxStr.strokeStyle = colors[i % colors.length];
                        ctxStr.lineWidth = 3;
                        ctxStr.setLineDash([5, 5]);
                        
                        stringArray.forEach((pIdx, idx) => {
                            let p = panelsOnRoof[pIdx];
                            if(!p) return;
                            const cx = startX + p.x * scale + (p.w * scale) / 2;
                            const cy = startY + p.y * scale + (p.h * scale) / 2;
                            if (idx === 0) {
                                ctxStr.moveTo(cx, cy);
                            } else {
                                ctxStr.lineTo(cx, cy);
                            }
                            
                            // Vẽ cực
                            ctxStr.fillStyle = 'white';
                            ctxStr.fillRect(cx - 10, cy - 10, 20, 20);
                            ctxStr.fillStyle = 'black';
                            ctxStr.font = '12px Arial';
                            ctxStr.fillText('+', cx - 4, cy - 1);
                            ctxStr.fillText('-', cx - 4, cy + 9);
                        });
                        ctxStr.stroke();
                    });
                } else {
                    // TỰ ĐỘNG CHIA BẰNG K-MEANS CLUSTERING (AUTO)
                    const numStrings = invertersConfig.reduce((sum, inv) => sum + (inv.numStrings || 1), 0);
                    let clusters = [];
                    
                    if (numStrings >= panelsOnRoof.length) {
                        clusters = panelsOnRoof.map(p => [p]);
                    } else if (numStrings === 1) {
                        clusters = [panelsOnRoof];
                    } else {
                        // K-Means++
                        let centroids = [];
                        centroids.push({...panelsOnRoof[0]});
                        for (let i = 1; i < numStrings; i++) {
                            let maxDist = -1;
                            let nextCentroid = null;
                            panelsOnRoof.forEach(p => {
                                let minToC = Infinity;
                                centroids.forEach(c => {
                                    let d = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
                                    if (d < minToC) minToC = d;
                                });
                                if (minToC > maxDist) {
                                    maxDist = minToC;
                                    nextCentroid = {...p};
                                }
                            });
                            centroids.push(nextCentroid);
                        }
                        
                        let assignments = new Array(panelsOnRoof.length).fill(0);
                        let changed = true;
                        let maxIter = 50;
                        
                        while (changed && maxIter > 0) {
                            changed = false;
                            maxIter--;
                            panelsOnRoof.forEach((p, i) => {
                                let minDist = Infinity;
                                let bestCluster = 0;
                                centroids.forEach((c, cIdx) => {
                                    let dist = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
                                    if (dist < minDist) {
                                        minDist = dist;
                                        bestCluster = cIdx;
                                    }
                                });
                                if (assignments[i] !== bestCluster) {
                                    assignments[i] = bestCluster;
                                    changed = true;
                                }
                            });
                            centroids.forEach((c, i) => {
                                let s = {x: 0, y: 0, count: 0};
                                assignments.forEach((clusterIdx, pIdx) => {
                                    if (clusterIdx === i) {
                                        s.x += panelsOnRoof[pIdx].x;
                                        s.y += panelsOnRoof[pIdx].y;
                                        s.count++;
                                    }
                                });
                                if (s.count > 0) {
                                    centroids[i].x = s.x / s.count;
                                    centroids[i].y = s.y / s.count;
                                }
                            });
                        }
                        
                        for (let i = 0; i < numStrings; i++) clusters.push([]);
                        panelsOnRoof.forEach((p, i) => {
                            clusters[assignments[i]].push(p);
                        });
                    }
                    
                    // Vẽ từng cụm (String)
                    clusters.forEach((clusterPanels, i) => {
                        if (clusterPanels.length === 0) return;
                        const sortedGroup = clusterPanels.sort((a, b) => {
                            if (Math.abs(a.y - b.y) > 1) return a.y - b.y;
                            return a.x - b.x;
                        });
                        
                        ctxStr.beginPath();
                        ctxStr.strokeStyle = colors[i % colors.length];
                        ctxStr.lineWidth = 3;
                        ctxStr.setLineDash([5, 5]);
                        
                        sortedGroup.forEach((p, idx) => {
                            const cx = startX + p.x * scale + (p.w * scale) / 2;
                            const cy = startY + p.y * scale + (p.h * scale) / 2;
                            if (idx === 0) ctxStr.moveTo(cx, cy);
                            else ctxStr.lineTo(cx, cy);
                            
                            ctxStr.fillStyle = 'white';
                            ctxStr.fillRect(cx - 10, cy - 10, 20, 20);
                            ctxStr.fillStyle = 'black';
                            ctxStr.font = '12px Arial';
                            ctxStr.fillText('+', cx - 4, cy - 1);
                            ctxStr.fillText('-', cx - 4, cy + 9);
                        });
                        ctxStr.stroke();
                    });
                }
                
                ctxStr.setLineDash([]);
            }
            const imgStringing = stringCanvas.toDataURL('image/jpeg', 0.9);
            
            // Khôi phục 3D nếu cần
            if (was3D) {
                scene.classList.add('view-3d');
                updateSceneTransform();
                draw();
            }

            // --- TẠO NỘI DUNG HTML CỦA PDF ---
            const container = document.getElementById('pdfContainer');
            
            function createTitleBlock(pageName, pageNum, totalPages = 6) {
                const projectID = "SL24H-" + today.replace(/\//g,'');
                // Sử dụng biến projectName đã tính toán ở đầu hàm
                
                return `
                <div class="pdf-title-block">
                    <!-- Column 1: Ghi chú -->
                    <div class="tb-col tb-notes">
                        <div class="tb-header">GHI CHÚ</div>
                        <div class="tb-content"></div>
                    </div>
                    
                    <!-- Column 2: Info (Dự án, Chủ đầu tư, Địa chỉ) -->
                    <div class="tb-col tb-info">
                        <div class="tb-row"><span class="tb-label">TÊN DỰ ÁN:</span> ${projectName}</div>
                        <div class="tb-row"><span class="tb-label">CHỦ ĐẦU TƯ:</span> <span class="tb-val-name">${custName}</span></div>
                        <div class="tb-row" style="border-bottom: none;"><span class="tb-label">ĐỊA CHỈ LẮP ĐẶT:</span> <span class="tb-val-address">${custAddress}</span></div>
                    </div>
                    
                    <!-- Column 3: Đơn vị, Phê duyệt -->
                    <div class="tb-col tb-company">
                        <div class="tb-row tb-center" style="flex: 1.2;">
                            <span class="tb-label">ĐƠN VỊ THIẾT KẾ & THI CÔNG</span>
                            <span style="color: #16a34a; font-size: 16px; font-weight: bold; margin-top: 4px; display: inline-block;">XB SOLAR</span>
                        </div>
                        <div class="tb-row" style="border-bottom: none; flex: 0.8; justify-content: flex-start; padding-top: 6px;">
                            <span class="tb-label">PHÊ DUYỆT:</span>
                        </div>
                    </div>
                    
                    <!-- Column 4: Tên bản vẽ, Ngày, Số bản vẽ, Số hiệu -->
                    <div class="tb-col tb-details">
                        <div class="tb-row tb-center" style="flex: 1.5; font-size: 13px;">
                            <span class="tb-label">${pageName.toUpperCase()}</span>
                        </div>
                        <div class="tb-row tb-split" style="flex: 1;">
                            <div class="tb-split-half" style="border-right: 1px solid #000;"><span class="tb-label">NGÀY:</span> ${today}</div>
                            <div class="tb-split-half"><span class="tb-label">BẢN VẼ SỐ:</span> 0${pageNum}/0${totalPages}</div>
                        </div>
                        <div class="tb-row" style="border-bottom: none; flex: 1;">
                            <span class="tb-label">SỐ HIỆU BẢN VẼ:</span> ${projectID}
                        </div>
                    </div>
                </div>
                `;
            }
            
            // --- Convert SVGs to Base64 Images to prevent html2canvas scaling bugs ---
            const b64_diagramSVG = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(diagramSVG)));
            
            let wallSvgText = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800" width="1000" height="800" preserveAspectRatio="xMidYMid meet">
                    <rect width="1000" height="800" fill="#f8fafc" />
                    <line x1="0" y1="700" x2="1000" y2="700" stroke="#94a3b8" stroke-width="8" /> <!-- Sàn nhà -->
                    <text x="500" y="730" fill="#64748b" font-size="16" text-anchor="middle">Mặt sàn</text>
            `;
            
            const invW = 160;
            const batW = 200;
            const gap = 40;
            const tuDienX = 60;
            
            // Vẽ Tủ điện AC/DC
            let tuDienDraw = '';
            if (window.customImages && window.customImages.panel) {
                tuDienDraw = `<image href="${window.customImages.panel}" x="${tuDienX}" y="120" width="140" height="180" preserveAspectRatio="xMidYMid meet" />`;
            } else {
                tuDienDraw = `
                    <rect x="${tuDienX}" y="120" width="140" height="180" fill="#f1f5f9" stroke="#64748b" stroke-width="3" rx="4" />
                    <text x="${tuDienX + 70}" y="210" fill="#1e293b" font-size="18" font-weight="bold" text-anchor="middle">TỦ ĐIỆN</text>
                    <text x="${tuDienX + 70}" y="235" fill="#64748b" font-size="14" text-anchor="middle">AC / DC</text>
                `;
            }
            wallSvgText += `
                    <!-- Tủ AC/DC -->
                    ${tuDienDraw}
            `;

            // Vẽ Inverters
            const startInvX = tuDienX + 140 + gap;
            for(let i=0; i<inverterQty; i++) {
                const x = startInvX + i * (invW + gap);
                if (i === 0) {
                    wallSvgText += `<path d="M ${x + invW/2} 210 L ${tuDienX + 140} 210" fill="none" stroke="#cbd5e1" stroke-width="15" />`;
                } else {
                    wallSvgText += `<path d="M ${x + invW/2} 210 L ${x - gap + invW/2} 210" fill="none" stroke="#cbd5e1" stroke-width="15" />`;
                }
                let invDraw = '';
                if (window.customImages && window.customImages.inverter) {
                    invDraw = `<image href="${window.customImages.inverter}" x="${x}" y="100" width="${invW}" height="220" preserveAspectRatio="xMidYMid meet" />`;
                } else if (invertersConfig[i].autoImg) {
                    invDraw = `<image href="${invertersConfig[i].autoImg}" x="${x}" y="100" width="${invW}" height="220" preserveAspectRatio="xMidYMid meet" />`;
                } else {
                    invDraw = `
                        <rect x="${x}" y="100" width="${invW}" height="220" fill="#ffffff" stroke="#00A859" stroke-width="4" rx="10" />
                        <rect x="${x + 20}" y="120" width="120" height="60" fill="#0f2027" rx="4" />
                        <text x="${x + invW/2}" y="220" fill="#1e293b" font-size="16" font-weight="bold" text-anchor="middle">INVERTER ${inverterQty>1 ? i+1 : ''}</text>
                        <text x="${x + invW/2}" y="250" fill="#16a34a" font-size="14" font-weight="bold" text-anchor="middle">${invertersConfig[i].model}</text>
                    `;
                }
                wallSvgText += `
                    <!-- Inverter ${i+1} -->
                    ${invDraw}
                `;
            }

            // Vẽ Battery
            const batteriesToDraw = invertersConfig.filter(i => i.batteryModel !== 'none').map(i => i.batteryModel);
            if (batteriesToDraw.length > 0) {
                const drawBatteryQty = batteriesToDraw.length;
                const centerOffset = (inverterQty > drawBatteryQty) ? (inverterQty - drawBatteryQty)*(invW+gap)/2 : 0;
                const startBatX = startInvX + centerOffset;
                for(let i=0; i<drawBatteryQty; i++) {
                    const batMod = batteriesToDraw[i];
                    const x = startBatX + i * (batW + gap);
                    const parentInvX = startInvX + Math.min(i, inverterQty-1) * (invW + gap);
                    wallSvgText += `<path d="M ${parentInvX + invW/2} 320 L ${parentInvX + invW/2} 360 L ${x + batW/2} 360 L ${x + batW/2} 520" fill="none" stroke="#cbd5e1" stroke-width="15" />`;
                    let batDraw = '';
                    const invCfg = invertersConfig.find(inv => inv.batteryModel === batMod);
                    const autoBatImg = invCfg ? invCfg.autoBatImg : null;
                    if (window.customImages && window.customImages.battery) {
                        batDraw = `<image href="${window.customImages.battery}" x="${x}" y="380" width="${batW}" height="280" preserveAspectRatio="xMidYMid meet" />`;
                    } else if (autoBatImg) {
                        batDraw = `<image href="${autoBatImg}" x="${x}" y="380" width="${batW}" height="280" preserveAspectRatio="xMidYMid meet" />`;
                    } else {
                        batDraw = `
                            <rect x="${x}" y="380" width="${batW}" height="280" fill="#1e293b" rx="8" />
                            <rect x="${x + (batW/2 - 20)}" y="395" width="40" height="10" fill="#10b981" rx="2" />
                            <text x="${x + batW/2}" y="520" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">PIN LƯU TRỮ ${drawBatteryQty>1 ? i+1 : ''}</text>
                            <text x="${x + batW/2}" y="550" fill="#38bdf8" font-size="16" text-anchor="middle">${batMod}</text>
                        `;
                    }
                    wallSvgText += `
                        <!-- Battery ${i+1} -->
                        ${batDraw}
                    `;
                }
            }

            wallSvgText += `
                    <!-- Chú thích kích thước -->
                    <line x1="${tuDienX - 30}" y1="100" x2="${tuDienX - 30}" y2="700" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,5" />
                    <text x="${tuDienX - 20}" y="400" fill="#dc2626" font-size="14">Cao độ ~1.6m</text>
                </svg>
            `;
            const b64_wallSvg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(wallSvgText.trim())));

            container.innerHTML = `
                <!-- Trang 1: Bìa -->
                <div class="pdf-page">
                    <div class="pdf-cover">
                        <img src="Logo XB SOLAR.png" alt="Logo" onerror="this.style.display='none'" style="max-width:300px; margin-bottom: 20px;">
                        <h1 contenteditable="true" spellcheck="false" style="outline: none;">BẢN VẼ THIẾT KẾ</h1>
                        <h2 contenteditable="true" spellcheck="false" style="outline: none;">CÔNG TRÌNH: HỆ THỐNG ĐIỆN MẶT TRỜI MÁI NHÀ</h2>
                        <h3 contenteditable="true" spellcheck="false" style="outline: none; font-size: 1.2rem; color: var(--text-dark); margin-bottom: 30px;">ĐỊA ĐIỂM LẮP ĐẶT: <span class="tb-val-address" style="font-weight: normal;">${custAddress}</span></h3>
                        <div contenteditable="true" spellcheck="false" style="outline: none; font-size: 1.5rem; color: var(--text-dark); margin-bottom: 10px;">
                            <b style="text-transform: uppercase;">${projectName.replace('HỆ THỐNG ĐIỆN NLMT ', '')}</b>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;"><img src="logo-smarttech-nbg.png" style="height: 150px;"></div>
                        <div class="pdf-customer-info" style="border-top: none; display: flex; justify-content: space-between; text-align: center; margin-top: auto; padding-top: 50px;">
                            <div style="flex: 1;">
                                <p contenteditable="true" spellcheck="false" style="outline: none; font-weight: bold; font-size: 1.2rem;">CHỦ ĐẦU TƯ</p>
                                <div style="height: 100px;"></div>
                                <p contenteditable="true" spellcheck="false" class="tb-val-name" style="outline: none; font-weight: bold; font-size: 1.2rem; text-transform: uppercase;">${custName}</p>
                            </div>
                            <div style="flex: 1;">
                                <p contenteditable="true" spellcheck="false" style="outline: none; font-weight: bold; font-size: 1.2rem;">ĐƠN VỊ THI CÔNG - LẮP ĐẶT</p>
                                <p contenteditable="true" spellcheck="false" style="outline: none; font-weight: bold; font-size: 1.1rem; margin-top: 5px;">GIÁM ĐỐC</p>
                                <div style="height: 80px;"></div>
                                <p contenteditable="true" spellcheck="false" style="outline: none; font-weight: bold; font-size: 1.2rem;">HỒ NGỌC PHƯƠNG</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trang 2: Danh sách thiết bị -->
                <div class="pdf-page page-break">
                    <h2 class="pdf-page-title">1. DANH SÁCH THIẾT BỊ HỆ THỐNG</h2>
                    <table class="pdf-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên Thiết Bị / Vật Tư</th>
                                <th>Mô Tả / Thông Số Kỹ Thuật</th>
                                <th>Số Lượng</th>
                                <th>ĐVT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Tấm Pin Năng Lượng Mặt Trời</td>
                                <td>${finalPanelCount > 0 ? document.getElementById('panelType').options[document.getElementById('panelType').selectedIndex].text : 'Chưa chọn'}</td>
                                <td>${finalPanelCount}</td>
                                <td>Tấm</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Bộ Chuyển Đổi (Inverter)</td>
                                <td>${inverterModel} - Kết nối lưới, có khả năng lưu trữ</td>
                                <td>${inverterQty}</td>
                                <td>Bộ</td>
                            </tr>
                            ${batteryModel !== 'none' ? `
                            <tr>
                                <td>3</td>
                                <td>Pin lưu trữ (Lithium Battery)</td>
                                <td>${batteryModel} - Công nghệ Lithium an toàn</td>
                                <td>${batteryQty}</td>
                                <td>Bộ</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td>${batteryModel !== 'none' ? '4' : '3'}</td>
                                <td>Hệ thống giàn khung đỡ</td>
                                <td>${installType} (Theo thông số thiết kế)</td>
                                <td>1</td>
                                <td>Hệ</td>
                            </tr>
                            <tr>
                                <td>${batteryModel !== 'none' ? '5' : '4'}</td>
                                <td>Tủ điện đóng cắt bảo vệ</td>
                                <td>Tích hợp CB DC/AC, Chống sét lan truyền SPD</td>
                                <td>1</td>
                                <td>Tủ</td>
                            </tr>
                            <tr>
                                <td>${batteryModel !== 'none' ? '6' : '5'}</td>
                                <td>Dây cáp chuyên dụng DC/AC</td>
                                <td>Cáp Solar 4mm2 / 6mm2, Cáp AC Cadivi</td>
                                <td>1</td>
                                <td>Gói</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h3 style="margin-top:40px; margin-bottom: 20px;">Dự toán Hiệu quả Năng lượng</h3>
                    <div style="display: flex; gap: 20px;">
                        <div style="flex:1; border: 1px solid #e5e7eb; padding: 20px; text-align:center; border-radius: 8px;">
                            <div style="font-size:2rem; font-weight:bold; color:var(--primary-green);">${totalKWp}</div>
                            <div>Tổng công suất (kWp)</div>
                        </div>
                        <div style="flex:1; border: 1px solid #e5e7eb; padding: 20px; text-align:center; border-radius: 8px;">
                            <div style="font-size:2rem; font-weight:bold; color:var(--primary-green);">${monthlyEnergyText}</div>
                            <div>Sản lượng dự kiến (Tháng)</div>
                        </div>
                    </div>
                    ${createTitleBlock('DANH SÁCH THIẾT BỊ HỆ THỐNG', 2)}
                </div>

                <!-- Trang 3: Sơ đồ đấu nối hệ thống (Tĩnh) -->
                <div class="pdf-page page-break">
                    <h2 class="pdf-page-title">2. SƠ ĐỒ ĐẤU NỐI HỆ THỐNG (NGUYÊN LÝ)</h2>
                    <div class="pdf-image-container" style="background: white;">
                        <img src="${b64_diagramSVG}" alt="Sơ đồ nguyên lý">
                    </div>
                    ${createTitleBlock('SƠ ĐỒ ĐẤU NỐI HỆ THỐNG (NGUYÊN LÝ)', 3)}
                </div>

                <!-- Trang 4: Bố trí pin trên mái -->
                <div class="pdf-page page-break">
                    <h2 class="pdf-page-title">3. SƠ ĐỒ BỐ TRÍ TẤM PIN TRÊN MÁI</h2>
                    <div class="pdf-image-container" style="display:flex; flex-direction:column; gap:20px; padding: 10px;">
                        <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
                            <h3 style="font-size:14px; margin-bottom:5px;">PHỐI CẢNH 3D</h3>
                            <img src="${img3D}" alt="Sơ đồ 3D" style="max-height:350px; border:1px solid #e2e8f0; padding:5px; border-radius:4px;">
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
                            <h3 style="font-size:14px; margin-bottom:5px;">MẶT BẰNG 2D</h3>
                            <img src="${imgLayout}" alt="Sơ đồ 2D" style="max-height:350px; border:1px solid #e2e8f0; padding:5px; border-radius:4px;">
                        </div>
                    </div>
                    <p style="margin-top: 15px; font-size: 1.1rem; text-align:center;">Kích thước mái: <b>${roofLength}m x ${roofWidth}m</b>. Tổng số tấm pin: <b>${finalPanelCount} tấm</b>.</p>
                    ${createTitleBlock('SƠ ĐỒ BỐ TRÍ TẤM PIN TRÊN MÁI', 4)}
                </div>

                <!-- Trang 5: Đấu nối tấm pin -->
                <div class="pdf-page page-break">
                    <h2 class="pdf-page-title">4. SƠ ĐỒ ĐẤU NỐI DÂY TRÊN MÁI (STRINGING)</h2>
                    <div class="pdf-image-container">
                        <img src="${imgStringing}" alt="Sơ đồ stringing">
                    </div>
                    <p style="margin-top: 15px; font-size: 1.1rem; color: #dc2626;">Các đường đứt nét với màu sắc khác nhau thể hiện các đường dây DC nối tiếp các tấm pin với nhau (các String độc lập).</p>
                    ${createTitleBlock('SƠ ĐỒ ĐẤU NỐI DÂY TRÊN MÁI (STRINGING)', 5)}
                </div>

                <!-- Trang 6: Mặt cắt thiết bị -->
                <div class="pdf-page page-break">
                    <h2 class="pdf-page-title">5. BỐ TRÍ THIẾT BỊ TRÊN TƯỜNG</h2>
                    <div class="pdf-image-container" style="background: #e2e8f0;">
                        <img src="${b64_wallSvg}" alt="Bố trí thiết bị">
                    </div>
                    ${createTitleBlock('BỐ TRÍ THIẾT BỊ TRÊN TƯỜNG', 6)}
                </div>
            `;
            
            // Đã render xong HTML
            loading.style.display = 'none';
        }

        // --- CUSTOM IMAGES ---
        const customImages = {
            inverter: localStorage.getItem('customImg_inverter') || null,
            battery: localStorage.getItem('customImg_battery') || null,
            panel: localStorage.getItem('customImg_panel') || null
        };

        function updateImgPreview(type) {
            const container = document.getElementById(`preview${type}Container`);
            const img = document.getElementById(`preview${type}Img`);
            if (customImages[type.toLowerCase()]) {
                img.src = customImages[type.toLowerCase()];
                container.style.display = 'flex';
            } else {
                container.style.display = 'none';
            }
        }
        
        ['Inverter', 'Battery', 'Panel'].forEach(type => {
            updateImgPreview(type);
            
            document.getElementById(`upload${type}Img`).addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const b64 = evt.target.result;
                        customImages[type.toLowerCase()] = b64;
                        localStorage.setItem(`customImg_${type.toLowerCase()}`, b64);
                        updateImgPreview(type);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            document.getElementById(`btnClear${type}Img`).addEventListener('click', function() {
                customImages[type.toLowerCase()] = null;
                localStorage.removeItem(`customImg_${type.toLowerCase()}`);
                document.getElementById(`upload${type}Img`).value = '';
                updateImgPreview(type);
            });
        });

        init();
    