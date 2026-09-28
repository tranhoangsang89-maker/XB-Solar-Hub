// --- Dữ liệu Pricing ---
const pricingData = {
    "standard_packages": [
        {"code": "SOLAR F1", "kwp": 2.3, "price": 47800000, "bill_min": 0, "bill_max": 500000},
        {"code": "SOLAR F2", "kwp": 4.6, "price": 68500000, "bill_min": 500000, "bill_max": 1000000},
        {"code": "SOLAR F3", "kwp": 5.8, "price": 88000000, "bill_min": 1000000, "bill_max": 1500000},
        {"code": "SOLAR F4", "kwp": 6.9, "price": 104700000, "bill_min": 1500000, "bill_max": 2000000},
        {"code": "SOLAR F5", "kwp": 8.1, "price": 114900000, "bill_min": 2000000, "bill_max": 2500000},
        {"code": "SOLAR F6", "kwp": 9.3, "price": 123600000, "bill_min": 2500000, "bill_max": 3000000},
        {"code": "SOLAR F7", "kwp": 11.6, "price": 203000000, "bill_min": 3000000, "bill_max": 4000000},
        {"code": "SOLAR F8", "kwp": 13.9, "price": 217900000, "bill_min": 4000000, "bill_max": 5000000},
        {"code": "SOLAR F9", "kwp": 17.4, "price": 239000000, "bill_min": 5000000, "bill_max": 7000000},
        {"code": "SOLAR F10", "kwp": 22.0, "price": 329300000, "bill_min": 7000000, "bill_max": 999000000}
    ],
    "itemized_prices": {
        "panels": {
            "AE_Solar_580W": 2850000,
            "AE_Solar_730W": 3250000,
            "TCL_Solar_620W": 2650000,
            "TCL_Solar_650W": 2780000
        },
        "inverters": {
            "LuxPower_SNA_5000W": 15200000,
            "LuxPower_6.5PRO": 19500000,
            "LuxPower_Gen3_8kW": 31500000,
            "LuxPower_Trip_15K_3P": 54000000,
            "LuxPower_3Phase_20kW": 58500000
        },
        "batteries": {
            "BSB_2.5kWh": 13500000,
            "BSB_5kWh": 22000000,
            "LS_10kWh": 33500000,
            "LS_16kWh": 41500000,
            "Deye_16kWh": 52500000
        }
    },
    "shinhan_bank": {
        "max_loan": 100000000,
        "interest_rate_monthly": 0.0059
    }
};

// --- Utils ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

// --- DOM Elements ---
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const dashboard = document.getElementById('dashboard');

// Inputs
const billInput = document.getElementById('monthly-bill');
const kwpInput = document.getElementById('kwp-input');
const kwhSelect = document.getElementById('kwh-input');
const roofSelect = document.getElementById('roof-type');

// Outputs
const tbody = document.getElementById('quote-tbody');
const resultPackageName = document.getElementById('result-package-name');
const totalPriceEl = document.getElementById('total-price');

const loanAmountEl = document.getElementById('loan-amount');
const upfrontAmountEl = document.getElementById('upfront-amount');
const monthly36El = document.getElementById('monthly-36');
const monthly48El = document.getElementById('monthly-48');

const roiOutputEl = document.getElementById('roi-output');
const roiSavingEl = document.getElementById('roi-saving');
const roiYearsEl = document.getElementById('roi-years');

// --- Tab Switching ---
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add to clicked
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
        
        // Hide dashboard on switch
        dashboard.classList.add('hidden');
    });
});

// --- Calculations ---

// Mode 1: Tính theo tiền điện
document.getElementById('calc-btn-1').addEventListener('click', () => {
    const bill = parseInt(billInput.value.replace(/\D/g, '')) || 0;
    const panelType = document.getElementById('panel-type-1').value;
    const roofType = document.getElementById('roof-type-1').value;
    
    if (bill <= 0) {
        alert("Vui lòng nhập số tiền điện hợp lệ!");
        return;
    }
    
    // Tìm gói phù hợp
    let selectedPackage = pricingData.standard_packages[pricingData.standard_packages.length - 1]; // Mặc định gói cao nhất nếu vượt quá
    for (let pkg of pricingData.standard_packages) {
        if (bill >= pkg.bill_min && bill < pkg.bill_max) {
            selectedPackage = pkg;
            break;
        }
    }
    
    renderStandardPackage(selectedPackage, roofType, panelType);
});

// Mode 2: Tính theo tùy chỉnh
document.getElementById('calc-btn-2').addEventListener('click', () => {
    const kwp = parseFloat(kwpInput.value) || 0;
    const kwh = parseFloat(kwhSelect.value) || 0;
    const roof = roofSelect.value;
    const panelType = document.getElementById('panel-type-2').value;
    
    if (kwp <= 0) {
        alert("Vui lòng nhập công suất hợp lệ!");
        return;
    }
    
    renderCustomPackage(kwp, kwh, roof, panelType);
});

// --- Render Logic ---

// --- Logic Bóc Tách Vật Tư ---
let currentQuoteState = {
    items: [],
    kwp: 0,
    roof: 'ton',
    packageName: ''
};

const panelOptionsList = () => [
    { id: 'AE_Solar_580W', label: 'Tấm Pin AE Solar 580W Mono', price: pricingData.itemized_prices.panels.AE_Solar_580W, power: 580 },
    { id: 'AE_Solar_730W', label: 'Tấm Pin AE Solar 730W Mono', price: pricingData.itemized_prices.panels.AE_Solar_730W, power: 730 },
    { id: 'TCL_Solar_620W', label: 'Tấm Pin TCL Solar 620W', price: pricingData.itemized_prices.panels.TCL_Solar_620W, power: 620 },
    { id: 'TCL_Solar_650W', label: 'Tấm Pin TCL Solar 650W', price: pricingData.itemized_prices.panels.TCL_Solar_650W, power: 650 }
];

const inverterOptionsList = () => [
    { id: 'LuxPower_SNA_5000W', label: 'Inverter Hybrid LuxPower SNA 5000W', price: pricingData.itemized_prices.inverters.LuxPower_SNA_5000W, power: 5 },
    { id: 'LuxPower_6.5PRO', label: 'Inverter Hybrid LuxPower 6.5PRO', price: pricingData.itemized_prices.inverters['LuxPower_6.5PRO'], power: 6.5 },
    { id: 'LuxPower_Gen3_8kW', label: 'Inverter Hybrid LuxPower Gen3 8kW', price: pricingData.itemized_prices.inverters.LuxPower_Gen3_8kW, power: 8 },
    { id: 'LuxPower_Trip_15K_3P', label: 'Inverter Hybrid LuxPower Trip 15K 3P', price: pricingData.itemized_prices.inverters.LuxPower_Trip_15K_3P, power: 15 },
    { id: 'LuxPower_3Phase_20kW', label: 'Inverter LuxPower 3 Phase 20kW', price: pricingData.itemized_prices.inverters.LuxPower_3Phase_20kW, power: 20 }
];

const batteryOptionsList = () => [
    { id: 'none', label: 'Không dùng pin lưu trữ (Hòa lưới)', price: 0, capacity: 0 },
    { id: 'BSB_2.5kWh', label: 'Pin Lưu Trữ Lithium BSB 2.5kWh', price: pricingData.itemized_prices.batteries['BSB_2.5kWh'], capacity: 2.5 },
    { id: 'BSB_5kWh', label: 'Pin Lưu Trữ Lithium BSB 5kWh', price: pricingData.itemized_prices.batteries.BSB_5kWh, capacity: 5 },
    { id: 'LS_10kWh', label: 'Pin Lưu Trữ Lithium LS 10kWh', price: pricingData.itemized_prices.batteries.LS_10kWh, capacity: 10 },
    { id: 'LS_16kWh', label: 'Pin Lưu Trữ Lithium LS 16kWh', price: pricingData.itemized_prices.batteries.LS_16kWh, capacity: 16 },
    { id: 'Deye_16kWh', label: 'Pin Lưu Trữ Lithium Deye 16kWh', price: pricingData.itemized_prices.batteries.Deye_16kWh, capacity: 16 }
];

function getImageFor(itemName) {
    if (!itemName) return '';
    
    let imgName = '';
    
    // Panels
    if (itemName.includes('AE_Solar') || itemName.includes('TCL_Solar')) imgName = 'AE SOLAR 580_630_730W.png';
    // Inverters
    else if (itemName === 'LuxPower_SNA_5000W') imgName = 'Inverter LuxPower SNA 5kW.png';
    else if (itemName === 'LuxPower_6.5PRO') imgName = 'Inverter LuxPower 6.5 kW Pro.png';
    else if (itemName === 'LuxPower_Gen3_8kW') imgName = 'Inverter LuxPower Gen3 8kW.png';
    else if (itemName === 'LuxPower_Trip_15K_3P') imgName = 'Inverter LuxPower 12kW.png'; 
    else if (itemName === 'LuxPower_3Phase_20kW') imgName = 'Inverter LuxPower 3 Phase 20kW.png'; 
    // Batteries
    else if (itemName === 'BSB_2.5kWh' || itemName === 'BSB_5kWh') imgName = 'Pin BSB 5kWh.png';
    else if (itemName === 'LS_10kWh') imgName = 'Pin GigaBox 10kWh.png';
    else if (itemName === 'LS_16kWh' || itemName === 'Deye_16kWh') imgName = 'Pin LS 16kWh.png';
    // Static Items (matched by name)
    else if (itemName.includes('Tủ điện Hybrid')) imgName = 'Tủ điện Hybrid.png';
    else if (itemName.includes('Vật tư lắp đặt tấm pin')) imgName = 'vat_tu_lap_dat.jpg';
    else if (itemName.includes('Dây dẫn điện')) imgName = 'day_dan_dien.jpg';
    else if (itemName.includes('Chi phí vận chuyển & nhân công')) imgName = 'van_chuyen_nhan_cong.jpg';
    
    if (!imgName) return '';
    
    if (typeof imageData !== 'undefined' && imageData[imgName]) {
        return imageData[imgName];
    }
    
    return 'Vật tư thiết bị Solar/' + imgName;
}

function generateSystemItems(kwp, kwh, roof, fixedTotal = null, defaultPanelId = 'AE_Solar_580W') {
    currentQuoteState.kwp = kwp;
    currentQuoteState.roof = roof;
    currentQuoteState.items = [];
    
    let stt = 1;
    let totalInitialPrice = 0;
    
    // 1. Tấm pin
    const pOpt = panelOptionsList().find(o => o.id === defaultPanelId) || panelOptionsList()[0];
    const numPanels = Math.ceil((kwp * 1000) / pOpt.power);
    const panelPrice = pOpt.price;
    currentQuoteState.items.push({
        id: 'panel',
        stt: stt++,
        options: panelOptionsList(),
        selectedOptionId: defaultPanelId,
        unit: 'Tấm',
        qty: numPanels,
        editableQty: true,
        price: panelPrice,
        total: numPanels * panelPrice
    });
    totalInitialPrice += numPanels * panelPrice;
    
    // 2. Inverter
    let inverterId = 'LuxPower_SNA_5000W';
    let inverterQty = 1;
    if (kwp > 5 && kwp <= 8) inverterId = 'LuxPower_6.5PRO';
    else if (kwp > 8 && kwp <= 12) inverterId = 'LuxPower_Gen3_8kW';
    else if (kwp > 12) {
        inverterId = 'LuxPower_Trip_15K_3P';
        inverterQty = Math.ceil(kwp / 15);
    }
    const invOpt = inverterOptionsList().find(o => o.id === inverterId);
    currentQuoteState.items.push({
        id: 'inverter',
        stt: stt++,
        options: inverterOptionsList(),
        selectedOptionId: inverterId,
        unit: 'Bộ',
        qty: inverterQty,
        editableQty: true,
        price: invOpt.price,
        total: invOpt.price * inverterQty
    });
    totalInitialPrice += invOpt.price * inverterQty;
    
    // 3. Pin lưu trữ
    let batteryId = 'none';
    if (kwh > 0) {
        if (kwh === 2.5) batteryId = 'BSB_2.5kWh';
        else if (kwh === 5) batteryId = 'BSB_5kWh';
        else if (kwh === 10) batteryId = 'LS_10kWh';
        else if (kwh === 16) batteryId = 'LS_16kWh';
        else batteryId = 'BSB_5kWh';
    }
    const batOpt = batteryOptionsList().find(o => o.id === batteryId);
    currentQuoteState.items.push({
        id: 'battery',
        stt: stt++,
        options: batteryOptionsList(),
        selectedOptionId: batteryId,
        unit: 'Pack',
        qty: batteryId === 'none' ? 0 : 1,
        editableQty: true,
        price: batOpt.price,
        total: batOpt.price * (batteryId === 'none' ? 0 : 1)
    });
    totalInitialPrice += batOpt.price * (batteryId === 'none' ? 0 : 1);
    
    // 4. Vật tư phụ
    let inverterKw = invOpt.power * inverterQty;
    
    // Tủ điện (căn cứ theo số kW của inverter)
    let tuDienCost = 4500000;
    if (inverterKw >= 10 && inverterKw <= 14) tuDienCost = 6000000;
    else if (inverterKw >= 15) tuDienCost = 8000000;

    // Dây dẫn điện (căn cứ theo số kW của inverter)
    let dayDanCost = inverterKw * 650000;
    
    let vanChuyenCost = kwp * (roof === 'bang' ? 700000 : 500000);
    let vatTuPinCost = 0;
    
    if (fixedTotal !== null) {
        // Cân đối để tổng thành tiền khớp tuyệt đối với giá gói chuẩn
        let totalAccessoryCost = fixedTotal - totalInitialPrice;
        vatTuPinCost = totalAccessoryCost - tuDienCost - dayDanCost - vanChuyenCost;
        if (vatTuPinCost < 0) {
            vatTuPinCost = numPanels * (roof === 'bang' ? 450000 : 250000); // Fallback an toàn
        }
    } else {
        // Tính theo công thức chuẩn cho gói Tùy chỉnh
        vatTuPinCost = numPanels * (roof === 'bang' ? 450000 : 250000);
    }

    currentQuoteState.items.push({ id: 'tuDien', stt: stt++, name: `Tủ điện Hybrid (Tủ điện, CBDC, Chống sét DC/AC, CB Đảo)`, unit: 'Bộ', qty: 1, editableQty: false, editablePrice: true, price: tuDienCost, total: tuDienCost });
    
    let roofLabel = roof === 'ngoi' ? 'Mái Ngói' : (roof === 'bang' ? 'Mái Bằng' : 'Mái Tôn');
    currentQuoteState.items.push({ id: 'vatTu', stt: stt++, name: `Vật tư lắp đặt tấm pin ${roofLabel} (Pát Z, Kẹp, MC4, Ốc vít...)`, unit: 'Bộ', qty: 1, editableQty: false, editablePrice: true, price: vatTuPinCost, total: vatTuPinCost });
    currentQuoteState.items.push({ id: 'dayDan', stt: stt++, name: `Dây dẫn điện & tiếp địa (Bao gồm tối đa 25m cáp DC & 10m cáp AC. Phụ phí vượt định mức: 130.000 đ/m)`, unit: 'Bộ', qty: 1, editableQty: false, editablePrice: true, price: dayDanCost, total: dayDanCost });
    currentQuoteState.items.push({ id: 'vanChuyen', stt: stt++, name: `Chi phí vận chuyển & nhân công lắp đặt trọn gói`, unit: 'Lần', qty: 1, editableQty: false, editablePrice: true, price: vanChuyenCost, total: vanChuyenCost });

    renderTable();
}

function handleItemChange(id, field, value) {
    const item = currentQuoteState.items.find(i => i.id === id);
    if (!item) return;

    if (field === 'selectedOptionId') {
        item.selectedOptionId = value;
        const opt = item.options.find(o => o.id === value);
        if (opt) {
            item.price = opt.price;
            // Xử lý riêng cho logic "Không dùng pin"
            if (value === 'none') {
                item.qty = 0;
            } else if (item.qty === 0) {
                item.qty = 1; // Khôi phục qty nếu chọn pin lại
            }
        }
    } else if (field === 'qty') {
        item.qty = parseInt(value) || 0;
    } else if (field === 'price') {
        let numericValue = value.replace(/[^0-9]/g, '');
        item.price = parseInt(numericValue) || 0;
        item.isManuallyEdited = true;
    }

    item.total = item.price * item.qty;

    // Recalculate global kWp based on panel selection
    const panelItem = currentQuoteState.items.find(i => i.id === 'panel');
    let kwp = currentQuoteState.kwp;
    if (panelItem) {
        const pOpt = panelItem.options.find(o => o.id === panelItem.selectedOptionId);
        if (pOpt) {
            kwp = (panelItem.qty * pOpt.power) / 1000;
            currentQuoteState.kwp = kwp;
        }
    }
    const roof = currentQuoteState.roof;

    // Dynamic update for ALL accessories based on new kWp and roof (Custom Quote logic)
    const inverterItem = currentQuoteState.items.find(i => i.id === 'inverter');
    let inverterKw = 0;
    if (inverterItem) {
        const invOpt = inverterItem.options.find(o => o.id === inverterItem.selectedOptionId);
        if (invOpt) inverterKw = invOpt.power * inverterItem.qty;
    }

    const panelItemObj = currentQuoteState.items.find(i => i.id === 'panel');
    let numPanels = panelItemObj ? panelItemObj.qty : 0;

    const tuDienItem = currentQuoteState.items.find(i => i.id === 'tuDien');
    if (tuDienItem && !tuDienItem.isManuallyEdited) {
        if (inverterKw < 10) tuDienItem.price = 4500000;
        else if (inverterKw >= 10 && inverterKw <= 14) tuDienItem.price = 6000000;
        else tuDienItem.price = 8000000;
        tuDienItem.total = tuDienItem.price;
    }

    const dayDanItem = currentQuoteState.items.find(i => i.id === 'dayDan');
    if (dayDanItem && !dayDanItem.isManuallyEdited) {
        dayDanItem.price = inverterKw * 650000;
        dayDanItem.total = dayDanItem.price;
    }

    const vatTuItem = currentQuoteState.items.find(i => i.id === 'vatTu');
    if (vatTuItem && !vatTuItem.isManuallyEdited) {
        vatTuItem.price = numPanels * (roof === 'bang' ? 450000 : 250000);
        vatTuItem.total = vatTuItem.price;
    }

    const vanChuyenItem = currentQuoteState.items.find(i => i.id === 'vanChuyen');
    if (vanChuyenItem && !vanChuyenItem.isManuallyEdited) {
        vanChuyenItem.price = kwp * (roof === 'bang' ? 700000 : 500000);
        vanChuyenItem.total = vanChuyenItem.price;
    }

    renderTable();
}

// Gắn đối tượng vào window để có thể gọi từ HTML inline (onchange)
window.handleItemChange = handleItemChange;

function renderTable() {
    let html = '';
    let totalPrice = 0;
    
    let dynamicKwp = 0;
    let dynamicKwh = 0;
    
    currentQuoteState.items.forEach(item => {
        totalPrice += item.total;
        
        if (item.id === 'panel') {
            const pOpt = item.options.find(o => o.id === item.selectedOptionId);
            if (pOpt) dynamicKwp = (item.qty * pOpt.power) / 1000;
        }
        
        if (item.id === 'battery') {
            const bOpt = item.options.find(o => o.id === item.selectedOptionId);
            if (bOpt && bOpt.capacity !== undefined) dynamicKwh = item.qty * bOpt.capacity;
        }
        
        let imgTag = '';
        let imgSrc = '';
        
        let qtyHtml = item.editableQty ? 
            `<input type="number" class="table-input" min="0" value="${item.qty}" onchange="handleItemChange('${item.id}', 'qty', this.value)">` : 
            item.qty;
            
        let priceHtml = item.editablePrice ?
            `<input type="text" class="table-input price-input" style="width: 110px; text-align: center;" value="${formatCurrency(item.price)}" 
            oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.')" 
            onchange="handleItemChange('${item.id}', 'price', this.value)">` :
            formatCurrency(item.price);
        
        if (item.options) {
            // Dropdown mode
            const selectedOpt = item.options.find(o => o.id === item.selectedOptionId);
            imgSrc = getImageFor(item.selectedOptionId);
            
            let selectHtml = `<select class="table-select" onchange="handleItemChange('${item.id}', 'selectedOptionId', this.value)">`;
            item.options.forEach(opt => {
                const selected = opt.id === item.selectedOptionId ? 'selected' : '';
                selectHtml += `<option value="${opt.id}" ${selected}>${opt.label}</option>`;
            });
            selectHtml += `</select>`;
            
            if (imgSrc) {
                imgTag = `<img src="${encodeURI(imgSrc)}" alt="${selectedOpt?.label || ''}" class="item-image">`;
            }
            
            html += `
                <tr>
                    <td>${item.stt}</td>
                    <td>
                        <div class="item-cell">
                            ${imgTag}
                            <div class="item-details">
                                ${selectHtml}
                            </div>
                        </div>
                    </td>
                    <td>${item.unit}</td>
                    <td>${qtyHtml}</td>
                    <td>${priceHtml}</td>
                    <td>${formatCurrency(item.total)}</td>
                </tr>
            `;
        } else {
            // Static text mode
            imgSrc = getImageFor(item.name);
            if (imgSrc) {
                imgTag = `<img src="${encodeURI(imgSrc)}" alt="${item.name}" class="item-image">`;
            }
            
            html += `
                <tr>
                    <td>${item.stt}</td>
                    <td>
                        <div class="item-cell">
                            ${imgTag}
                            <div class="item-details">
                                <strong>${item.name}</strong>
                            </div>
                        </div>
                    </td>
                    <td>${item.unit}</td>
                    <td>${qtyHtml}</td>
                    <td>${priceHtml}</td>
                    <td>${formatCurrency(item.total)}</td>
                </tr>
            `;
        }
    });
    
    tbody.innerHTML = html;
    
    // Update dynamic title
    let titleStr = `${dynamicKwp.toFixed(2)} kWp`;
    if (dynamicKwh > 0) {
        titleStr += ` ; Lưu Trữ ${dynamicKwh} kWh`;
    } else {
        titleStr += ` (Hòa Lưới)`;
    }
    
    if (currentQuoteState.packageName) {
        resultPackageName.textContent = `${currentQuoteState.packageName} | Hệ Thống Điện Mặt Trời: ${titleStr}`;
    } else {
        resultPackageName.textContent = `Hệ Thống Điện Mặt Trời: ${titleStr}`;
    }
    
    updateDashboard(totalPrice, dynamicKwp);
}

function renderStandardPackage(pkg, roof = 'ton', panelId = 'AE_Solar_580W') {
    currentQuoteState.packageName = `Gói: ${pkg.code}`;
    let kwh = 0;
    if (pkg.kwp < 3) kwh = 2.5;
    else if (pkg.kwp >= 3 && pkg.kwp < 10) kwh = 5;
    else if (pkg.kwp >= 10 && pkg.kwp < 20) kwh = 10;
    else if (pkg.kwp >= 20) kwh = 16;
    
    generateSystemItems(pkg.kwp, kwh, roof, pkg.price, panelId);
}

function renderCustomPackage(kwp, kwh, roof, panelId = 'AE_Solar_580W') {
    currentQuoteState.packageName = `Tùy Chỉnh`;
    generateSystemItems(kwp, kwh, roof, null, panelId);
}

function updateDashboard(totalPrice, kwp) {
    totalPriceEl.textContent = `${formatCurrency(totalPrice)} VNĐ`;
    
    // 1. Calculate Shinhan Bank Loan
    const maxLoan = pricingData.shinhan_bank.max_loan; // 100,000,000
    const interest = pricingData.shinhan_bank.interest_rate_monthly; // 0.0059
    
    const loanAmount = Math.min(totalPrice, maxLoan);
    const upfrontAmount = totalPrice - loanAmount;
    
    loanAmountEl.textContent = `${formatCurrency(loanAmount)} VNĐ`;
    upfrontAmountEl.textContent = `${formatCurrency(upfrontAmount)} VNĐ`;
    
    // Công thức tính gốc + lãi hàng tháng = (Vay / Số tháng) + (Vay * Lãi suất tháng)
    const monthly36 = (loanAmount / 36) + (loanAmount * interest);
    const monthly48 = (loanAmount / 48) + (loanAmount * interest);
    
    monthly36El.textContent = `${formatCurrency(monthly36)} VNĐ/tháng`;
    monthly48El.textContent = `${formatCurrency(monthly48)} VNĐ/tháng`;
    
    // 2. Calculate ROI
    const outputMonthly = kwp * 130; // 130 kWh per kWp per month average
    const savingMonthly = outputMonthly * 3000; // 3000 VNĐ / kWh
    
    roiOutputEl.textContent = `${formatCurrency(outputMonthly)} kWh/tháng`;
    roiSavingEl.textContent = `${formatCurrency(savingMonthly)} VNĐ/tháng`;
    
    const yearsToPayback = totalPrice / (savingMonthly * 12);
    roiYearsEl.textContent = `${yearsToPayback.toFixed(1)} Năm`;
    
    // Show Dashboard
    dashboard.classList.remove('hidden');
    // Cuộn xuống mượt mà
    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- PDF Export ---
document.getElementById('btn-export-pdf').addEventListener('click', async () => {
    const element = document.getElementById('export-area');
    const btn = document.getElementById('btn-export-pdf');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo PDF...';
    btn.disabled = true;
    
    // Tạm thời thay thế select và input bằng text để PDF đẹp hơn và tránh lỗi html2canvas
    const selects = element.querySelectorAll('select');
    const inputs = element.querySelectorAll('input');
    const tempSpans = [];
    
    selects.forEach(select => {
        const span = document.createElement('span');
        span.textContent = select.options[select.selectedIndex].text;
        span.style.fontWeight = '600';
        span.style.color = 'var(--primary-color)';
        select.parentNode.insertBefore(span, select);
        select.style.display = 'none';
        tempSpans.push({ el: span, orig: select });
    });
    
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value;
        span.style.fontWeight = '600';
        input.parentNode.insertBefore(span, input);
        input.style.display = 'none';
        tempSpans.push({ el: span, orig: input });
    });
    
    // GIẢI PHÁP TỐI THƯỢNG: DI CHUYỂN BẢNG RA THẺ BODY & MỞ RỘNG KHUNG TỰ ĐỘNG
    // 1. Kéo bảng ra thẳng body để thoát khỏi mọi hệ thống lưới (tránh lệch tọa độ trái).
    // 2. Đo chính xác chiều rộng thực tế của bảng, và ép khung ảo của html2canvas mở rộng 
    //    cho tới khi bao trọn bảng (tránh bị cắt bên phải).

    const opt = {
      margin:       0.3,
      filename:     'Bao_Gia_Solar24h.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
          scale: 2, 
          useCORS: true,
          logging: false,
          scrollY: 0
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Scroll window to top to ensure accurate rendering
    const currentScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Tạm bỏ overflow để không bị cắt xén nội dung
    const tableResp = element.querySelector('.table-responsive');
    const originalOverflow = tableResp ? tableResp.style.overflow : '';
    if (tableResp) tableResp.style.overflow = 'visible';

    // Đợi 1 chút để DOM cập nhật
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error('PDF generation error:', err);
        alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại trên máy tính hoặc trình duyệt khác.');
    } finally {
        // Phục hồi lại overflow
        if (tableResp) tableResp.style.overflow = originalOverflow;
        
        // Phục hồi lại select và input
        tempSpans.forEach(item => {
            item.el.remove();
            item.orig.style.display = '';
        });
        
        // Phục hồi lại vị trí cuộn trang
        window.scrollTo(0, currentScrollY);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }

});

// --- Modal Handle ---
const modal = document.getElementById('lead-modal');
const btnShowModal = document.getElementById('btn-show-modal');
const closeBtn = document.querySelector('.close-btn');

btnShowModal.addEventListener('click', () => {
    modal.classList.add('show');
});

// Inject Base64 Logo if available to bypass Tainted Canvas PDF error
if (typeof imageData !== 'undefined' && imageData['Logo Solar 24h.png']) {
    const logoEl = document.getElementById('pdf-logo-img');
    if (logoEl) logoEl.src = imageData['Logo Solar 24h.png'];
}

closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.classList.remove('show');
    }
});

// Set Quote Date
(function setQuoteDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateEl = document.getElementById('quote-date');
    if (dateEl) {
        dateEl.innerText = `Ngày xuất bản báo giá: ${dd}/${mm}/${yyyy}`;
    }
})();

// Form Submit
document.getElementById('lead-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('lead-name').value;
    const phone = document.getElementById('lead-phone').value;
    
    if (name && phone) {
        alert(`Cảm ơn ${name}! Chúng tôi đã ghi nhận yêu cầu và sẽ gọi lại số ${phone} trong thời gian sớm nhất.`);
        modal.classList.remove('show');
        document.getElementById('lead-form').reset();
    }
});
