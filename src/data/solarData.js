// src/data/solarData.js

export const EVN_TARIFF = {
  tier1: { maxKwh: 50, price: 1893 },
  tier2: { maxKwh: 100, price: 1956 },
  tier3: { maxKwh: 200, price: 2271 },
  tier4: { maxKwh: 300, price: 2860 },
  tier5: { maxKwh: 400, price: 3197 },
  tier6: { maxKwh: Infinity, price: 3302 },
  vatRate: 0.08 // Thuế VAT 8%
};

export const PROVINCES_PSH = [
  // Miền Nam (PSH cao: 4.5 - 5.0)
  { name: 'TP. Hồ Chí Minh', psh: 4.6, region: 'Miền Nam' },
  { name: 'Bình Dương', psh: 4.6, region: 'Miền Nam' },
  { name: 'Đồng Nai', psh: 4.5, region: 'Miền Nam' },
  { name: 'Bà Rịa - Vũng Tàu', psh: 4.8, region: 'Miền Nam' },
  { name: 'Bình Phước', psh: 4.7, region: 'Miền Nam' },
  { name: 'Tây Ninh', psh: 4.8, region: 'Miền Nam' },
  { name: 'Long An', psh: 4.7, region: 'Miền Nam' },
  { name: 'Tiền Giang', psh: 4.7, region: 'Miền Nam' },
  { name: 'Bến Tre', psh: 4.6, region: 'Miền Nam' },
  { name: 'Trà Vinh', psh: 4.6, region: 'Miền Nam' },
  { name: 'Vĩnh Long', psh: 4.6, region: 'Miền Nam' },
  { name: 'Đồng Tháp', psh: 4.7, region: 'Miền Nam' },
  { name: 'An Giang', psh: 4.7, region: 'Miền Nam' },
  { name: 'Kiên Giang', psh: 4.6, region: 'Miền Nam' },
  { name: 'Cần Thơ', psh: 4.6, region: 'Miền Nam' },
  { name: 'Hậu Giang', psh: 4.6, region: 'Miền Nam' },
  { name: 'Sóc Trăng', psh: 4.6, region: 'Miền Nam' },
  { name: 'Bạc Liêu', psh: 4.6, region: 'Miền Nam' },
  { name: 'Cà Mau', psh: 4.5, region: 'Miền Nam' },
  // Tây Nguyên (PSH cao: 4.5 - 4.9)
  { name: 'Kon Tum', psh: 4.5, region: 'Tây Nguyên' },
  { name: 'Gia Lai', psh: 4.6, region: 'Tây Nguyên' },
  { name: 'Đắk Lắk', psh: 4.7, region: 'Tây Nguyên' },
  { name: 'Đắk Nông', psh: 4.7, region: 'Tây Nguyên' },
  { name: 'Lâm Đồng', psh: 4.5, region: 'Tây Nguyên' },
  // Miền Trung (PSH trung bình khá: 4.0 - 4.8)
  { name: 'Thanh Hóa', psh: 3.9, region: 'Miền Trung' },
  { name: 'Nghệ An', psh: 4.0, region: 'Miền Trung' },
  { name: 'Hà Tĩnh', psh: 4.0, region: 'Miền Trung' },
  { name: 'Quảng Bình', psh: 4.1, region: 'Miền Trung' },
  { name: 'Quảng Trị', psh: 4.2, region: 'Miền Trung' },
  { name: 'Thừa Thiên Huế', psh: 4.2, region: 'Miền Trung' },
  { name: 'Đà Nẵng', psh: 4.4, region: 'Miền Trung' },
  { name: 'Quảng Nam', psh: 4.4, region: 'Miền Trung' },
  { name: 'Quảng Ngãi', psh: 4.5, region: 'Miền Trung' },
  { name: 'Bình Định', psh: 4.6, region: 'Miền Trung' },
  { name: 'Phú Yên', psh: 4.6, region: 'Miền Trung' },
  { name: 'Khánh Hòa', psh: 4.7, region: 'Miền Trung' },
  { name: 'Ninh Thuận', psh: 5.1, region: 'Miền Trung' },
  { name: 'Bình Thuận', psh: 5.2, region: 'Miền Trung' },
  // Miền Bắc (PSH trung bình: 3.3 - 3.9)
  { name: 'Hà Nội', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Hải Phòng', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Quảng Ninh', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Bắc Ninh', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Hà Nam', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Hải Dương', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Hưng Yên', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Nam Định', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Ninh Bình', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Thái Bình', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Vĩnh Phúc', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Phú Thọ', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Bắc Giang', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Thái Nguyên', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Bắc Kạn', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Tuyên Quang', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Hà Giang', psh: 3.4, region: 'Miền Bắc' },
  { name: 'Cao Bằng', psh: 3.4, region: 'Miền Bắc' },
  { name: 'Lạng Sơn', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Hòa Bình', psh: 3.6, region: 'Miền Bắc' },
  { name: 'Sơn La', psh: 3.8, region: 'Miền Bắc' },
  { name: 'Điện Biên', psh: 3.9, region: 'Miền Bắc' },
  { name: 'Lai Châu', psh: 3.7, region: 'Miền Bắc' },
  { name: 'Lào Cai', psh: 3.5, region: 'Miền Bắc' },
  { name: 'Yên Bái', psh: 3.5, region: 'Miền Bắc' }
];

import { SOLAR_PANELS, INVERTERS, BATTERIES } from './bang-gia-thiet-bi';

// Hàm tính chi phí vật tư phụ và nhân công (BOS)
const calculateBOS = (systemCapacityKwp, panelQty) => {
  const tuDienPrice = systemCapacityKwp <= 8 ? 4500000 : 6500000;
  const khungRayPrice = panelQty * 450000;
  const capDienPrice = systemCapacityKwp * 650000;
  const nhanCongPrice = systemCapacityKwp * 800000;
  return tuDienPrice + khungRayPrice + capDienPrice + nhanCongPrice;
};

// Hàm tính tổng giá trị combo
const calculateComboPrice = (panelId, panelQty, inverterId, inverterQty = 1, batteryId, batteryQty = 1) => {
  const panel = SOLAR_PANELS.find(p => p.id === panelId);
  const inverter = INVERTERS.find(i => i.id === inverterId);
  const battery = batteryId ? BATTERIES.find(b => b.id === batteryId) : null;
  
  const kwp = (panel.wattage * panelQty) / 1000;
  
  const panelCost = panel.priceVnd * panelQty;
  const inverterCost = (inverter ? inverter.priceVnd : 0) * inverterQty;
  const batteryCost = (battery ? battery.priceVnd : 0) * batteryQty;
  const bosCost = calculateBOS(kwp, panelQty);

  return Math.round(panelCost + inverterCost + batteryCost + bosCost);
};

export const SYSTEM_COMBOS = {
  ongrid: [
    {
      id: 'ST-ECO-3K',
      name: 'Gói Tiết Kiệm ST-ECO 3kW',
      inverter: 'Sungrow SG3.0RS (1 Pha)',
      inverterId: 'SG-ONGRID-3K',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 4, // 4 * 720W = 2.88 kWp
      systemCapacityKwp: 2.88,
      areaRequiredM2: 13,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 4, 'SG-ONGRID-3K', 1, null, 0); },
      description: 'Phù hợp tiền điện 1.5 - 2.5 triệu/tháng, triệt tiêu điện giờ cao điểm ngày.'
    },
    {
      id: 'ST-ECO-5K',
      name: 'Gói Tiết Kiệm ST-ECO 5kW',
      inverter: 'Sungrow SG5.0RS (1 Pha)',
      inverterId: 'SG-ONGRID-5K',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 7, // 7 * 720W = 5.04 kWp
      systemCapacityKwp: 5.04,
      areaRequiredM2: 22,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 7, 'SG-ONGRID-5K', 1, null, 0); },
      description: 'Phù hợp tiền điện 2.5 - 4.5 triệu/tháng, gọt sạch bậc thang điện cao nhất.'
    },
    {
      id: 'ST-ECO-10K',
      name: 'Gói Tiết Kiệm ST-ECO 10kW',
      inverter: 'Sungrow SG10RS (1 Pha)',
      inverterId: 'SG-ONGRID-10K',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 14, // 14 * 720W = 10.08 kWp
      systemCapacityKwp: 10.08,
      areaRequiredM2: 43,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 14, 'SG-ONGRID-10K', 1, null, 0); },
      description: 'Phù hợp tiền điện 5 - 9 triệu/tháng cho nhà phố lớn, văn phòng gia đình.'
    }
  ],
  hybrid: [
    {
      id: 'ST-HYBRID-5K',
      name: 'Gói Toàn Diện ST-HYBRID 5kW (Áp Thấp)',
      inverter: 'Solis S6 5kW (1 Pha)',
      inverterId: 'SOLIS-HYBRID-5K',
      battery: 'Dyness DL5.0F (5.12 kWh)',
      batteryId: 'DYNESS-DL5',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 8, // 8 * 720W = 5.76 kWp
      systemCapacityKwp: 5.76,
      areaRequiredM2: 25,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 8, 'SOLIS-HYBRID-5K', 1, 'DYNESS-DL5', 1); },
      description: 'Giải pháp lưu trữ kinh tế, dùng điện mặt trời 24/7 và chống cúp điện.'
    },
    {
      id: 'ST-HYBRID-5K-PRO',
      name: 'Gói Cao Cấp ST-HYBRID 6kW (Lưu trữ lớn)',
      inverter: 'Sungrow MG6RL (1 Pha Hybrid)',
      inverterId: 'SG-HYBRID-6K',
      battery: 'Dyness Power Brick SC (16.0 kWh)',
      batteryId: 'DYNESS-BRICK-SC',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 9, // 9 * 720W = 6.48 kWp
      systemCapacityKwp: 6.48,
      areaRequiredM2: 28,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 9, 'SG-HYBRID-6K', 1, 'DYNESS-BRICK-SC', 1); },
      description: 'Lưu trữ cực lớn 16kWh, tự do chạy máy lạnh và thiết bị công suất lớn ban đêm.'
    },
    {
      id: 'ST-HYBRID-10K-3P',
      name: 'Gói Biệt Thự ST-HYBRID 10kW (3 Pha)',
      inverter: 'Solis S6 10kW (3 Pha)',
      inverterId: 'SOLIS-HYBRID-3P-10K',
      battery: 'Dyness PowerBox PRO (10.24 kWh)',
      batteryId: 'DYNESS-PBOX',
      panelModel: 'JA Solar 720W',
      panelId: 'JA-720W',
      panelQty: 14, // 14 * 720W = 10.08 kWp
      systemCapacityKwp: 10.08,
      areaRequiredM2: 43,
      get basePriceVnd() { return calculateComboPrice('JA-720W', 14, 'SOLIS-HYBRID-3P-10K', 1, 'DYNESS-PBOX', 1); },
      description: 'Dành riêng cho biệt thự và nhà phố 3 pha cao cấp, vận hành êm ái, an toàn tuyệt đối.'
    }
  ]
};

export const getCustomCombos = (targetKwp) => {
  let panelQty = Math.ceil(targetKwp / 0.72);
  // Ép số lượng tấm pin luôn là số chẵn để dễ chia string (chuỗi)
  if (panelQty % 2 !== 0) {
    panelQty += 1;
  }
  const actualKwp = Number((panelQty * 0.72).toFixed(2));
  
  const ongridInverters = INVERTERS.filter(i => i.systemType === 'ongrid')
    .sort((a, b) => b.powerKw - a.powerKw);
  // Chọn biến tần lớn nhất phù hợp, hoặc lấy biến tần lớn nhất có thể và tính số lượng
  const ongridInverter = ongridInverters.find(i => i.powerKw >= actualKwp * 0.8) || ongridInverters[0];
  const ongridQty = Math.max(1, Math.ceil(actualKwp / (ongridInverter.powerKw * 1.5)));
    
  const ongridCombo = {
    id: `CUSTOM-ONGRID-${actualKwp}`,
    name: `Gói Hòa Lưới Tùy Chỉnh ${actualKwp}kWp`,
    inverter: `${ongridInverter.brand} ${ongridInverter.model} (${ongridInverter.powerKw}kW)`,
    inverterId: ongridInverter.id,
    inverterQty: ongridQty,
    panelModel: 'JA Solar 720W',
    panelId: 'JA-720W',
    panelQty,
    systemCapacityKwp: actualKwp,
    areaRequiredM2: Math.round(panelQty * 2.384 * 1.303),
    get basePriceVnd() { return calculateComboPrice('JA-720W', panelQty, ongridInverter.id, ongridQty, null, 0); },
    description: 'Cấu hình tùy chỉnh theo công suất yêu cầu.'
  };

  const hybridInverters = INVERTERS.filter(i => i.systemType === 'hybrid')
    .sort((a, b) => b.powerKw - a.powerKw);
  const hybridInverter = hybridInverters.find(i => i.powerKw >= actualKwp * 0.8) || hybridInverters[0];
  const hybridQty = Math.max(1, Math.ceil(actualKwp / (hybridInverter.powerKw * 1.5)));
    
  let batteryId = 'DYNESS-DL5';
  if (actualKwp >= 12) batteryId = 'DYNESS-BRICK-SC';
  else if (actualKwp >= 8) batteryId = 'DYNESS-PBOX';
  const bat = BATTERIES.find(b => b.id === batteryId);
  const batteryQty = Math.max(1, Math.ceil(actualKwp / 15)); // Khoảng 15kWp cần 1 cục pin lớn

  const hybridCombo = {
    id: `CUSTOM-HYBRID-${actualKwp}`,
    name: `Gói Lưu Trữ Tùy Chỉnh ${actualKwp}kWp`,
    inverter: `${hybridInverter.brand} ${hybridInverter.model} (${hybridInverter.powerKw}kW)`,
    inverterId: hybridInverter.id,
    inverterQty: hybridQty,
    battery: `${bat.brand} ${bat.model} (${bat.capacityKwh} kWh)`,
    batteryId: bat.id,
    batteryQty: batteryQty,
    panelModel: 'JA Solar 720W',
    panelId: 'JA-720W',
    panelQty,
    systemCapacityKwp: actualKwp,
    areaRequiredM2: Math.round(panelQty * 2.384 * 1.303),
    get basePriceVnd() { return calculateComboPrice('JA-720W', panelQty, hybridInverter.id, hybridQty, batteryId, batteryQty); },
    description: 'Cấu hình lưu trữ tùy chỉnh theo công suất yêu cầu.'
  };

  return { ongridCombo, hybridCombo };
};

export const STANDARD_ACCESSORIES = [
  'Tủ điện AC/DC Solar Mersen bảo vệ chống sét lan truyền & quá dòng',
  'Bộ ngắt nhanh khẩn cấp Rapid Shutdown Sungrow SR20D-M an toàn PCCC',
  'Hệ khung ray nhôm chuyên dụng Antai/Hopergy chống ăn mòn muối biển',
  'Cáp điện DC chuyên dụng Leader/KBE 4.0mm², phụ kiện kẹp tiếp địa đạt chuẩn IEC'
];
