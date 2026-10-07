// bang-gia-thiet-bi.js - Cập nhật danh mục thiết bị & giá thi công chính thức XB Solar (10/2026)

// 1. TẤM PIN NĂNG LƯỢNG MẶT TRỜI
export const SOLAR_PANELS = [
  {
    id: 'JA-720W',
    brand: 'JA SOLAR',
    model: 'JAM66D46-720/LB',
    wattage: 720,
    origin: 'JA Solar / China',
    priceVnd: 2600000, // Đơn giá 2.600.000đ/tấm (~3.611 đ/Wp)
    length: 2.384,
    width: 1.303,
    warrantyPhysicalYears: 12,
    warrantyLinearYears: 30
  }
];

// 2. BIẾN TẦN (INVERTER) - PHÂN BIỆT RÕ RÀNG HÒA LƯỚI (ON-GRID) & LƯU TRỮ (HYBRID)
export const INVERTERS = [
  // ==============================================================
  // NHÓM A: INVERTER HÒA LƯỚI KHÔNG LƯU TRỮ (ON-GRID) - SUNGROW SG
  // ==============================================================
  {
    id: 'SG-ONGRID-3K',
    brand: 'SUNGROW',
    model: 'SG3.0RS',
    systemType: 'ongrid', // Hòa lưới bám tải
    phase: 1,
    powerKw: 3,
    description: 'Biến tần hòa lưới 1 pha 3kW Sungrow',
    priceVnd: 10500000
  },
  {
    id: 'SG-ONGRID-5K',
    brand: 'SUNGROW',
    model: 'SG5.0RS',
    systemType: 'ongrid', // Hòa lưới bám tải
    phase: 1,
    powerKw: 5,
    description: 'Biến tần hòa lưới 1 pha 5kW Sungrow',
    priceVnd: 13500000
  },
  {
    id: 'SG-ONGRID-8K',
    brand: 'SUNGROW',
    model: 'SG8.0RS',
    systemType: 'ongrid', // Hòa lưới bám tải
    phase: 1,
    powerKw: 8,
    description: 'Biến tần hòa lưới 1 pha 8kW Sungrow',
    priceVnd: 17200000
  },
  {
    id: 'SG-ONGRID-10K',
    brand: 'SUNGROW',
    model: 'SG10RS',
    systemType: 'ongrid', // Hòa lưới bám tải
    phase: 1,
    powerKw: 10,
    description: 'Biến tần hòa lưới 1 pha 10kW Sungrow',
    priceVnd: 19800000
  },
  {
    id: 'SG-ONGRID-15K-3P',
    brand: 'SUNGROW',
    model: 'SG15RT',
    systemType: 'ongrid', // Hòa lưới 3 pha
    phase: 3,
    powerKw: 15,
    description: 'Biến tần hòa lưới 3 pha 15kW Sungrow',
    priceVnd: 25500000
  },
  {
    id: 'SG-ONGRID-20K-3P',
    brand: 'SUNGROW',
    model: 'SG20RT',
    systemType: 'ongrid', // Hòa lưới 3 pha
    phase: 3,
    powerKw: 20,
    description: 'Biến tần hòa lưới 3 pha 20kW Sungrow',
    priceVnd: 29500000
  },

  // ==============================================================
  // NHÓM B: INVERTER HYBRID LƯU TRỮ (HYBRID) - SUNGROW MGRL & SOLIS S6
  // ==============================================================
  // 1. Sungrow Hybrid 1 Pha Áp Thấp
  {
    id: 'SG-HYBRID-6K',
    brand: 'SUNGROW',
    model: 'MG6RL',
    systemType: 'hybrid',
    phase: 1,
    powerKw: 6,
    description: 'Biến tần lưu trữ hòa lưới 1 pha 6kW Sungrow',
    priceVnd: 16602220
  },
  {
    id: 'SG-HYBRID-8K',
    brand: 'SUNGROW',
    model: 'MG8RL',
    systemType: 'hybrid',
    phase: 1,
    powerKw: 8,
    description: 'Biến tần lưu trữ hòa lưới 1 pha 8kW Sungrow',
    priceVnd: 22272000
  },
  {
    id: 'SG-HYBRID-10K',
    brand: 'SUNGROW',
    model: 'MG10RL',
    systemType: 'hybrid',
    phase: 1,
    powerKw: 10,
    description: 'Biến tần lưu trữ hòa lưới 1 pha 10kW Sungrow',
    priceVnd: 26984400
  },

  // 2. Solis Hybrid 1 Pha (S6-EH1P)
  { id: 'SOLIS-HYBRID-5K', brand: 'SOLIS', model: 'S6-EH1P5K-L-PLUS', systemType: 'hybrid', phase: 1, powerKw: 5, priceVnd: 20456667 },
  { id: 'SOLIS-HYBRID-6K', brand: 'SOLIS', model: 'S6-EH1P6K-L-PLUS', systemType: 'hybrid', phase: 1, powerKw: 6, priceVnd: 21695556 },
  { id: 'SOLIS-HYBRID-8K', brand: 'SOLIS', model: 'S6-EH1P8K-L-PLUS', systemType: 'hybrid', phase: 1, powerKw: 8, priceVnd: 29648889 },
  { id: 'SOLIS-HYBRID-10K', brand: 'SOLIS', model: 'S6-EH1P10K-L-PLUS', systemType: 'hybrid', phase: 1, powerKw: 10, priceVnd: 36012222 },
  { id: 'SOLIS-HYBRID-12K', brand: 'SOLIS', model: 'S6-EH1P12K03-NV-YD-L', systemType: 'hybrid', phase: 1, powerKw: 12, priceVnd: 41765556 },
  { id: 'SOLIS-HYBRID-14K', brand: 'SOLIS', model: 'S6-EH1P14K03-NV-YD-L', systemType: 'hybrid', phase: 1, powerKw: 14, priceVnd: 48023333 },
  { id: 'SOLIS-HYBRID-16K', brand: 'SOLIS', model: 'S6-EH1P16K03-NV-YD-L', systemType: 'hybrid', phase: 1, powerKw: 16, priceVnd: 51075556 },
  { id: 'SOLIS-HYBRID-18K', brand: 'SOLIS', model: 'S6-EH1P18K03-NV-YD-L', systemType: 'hybrid', phase: 1, powerKw: 18, priceVnd: 56268889 },

  // 3. Solis Hybrid 3 Pha Áp Thấp (S6-EH3P)
  { id: 'SOLIS-HYBRID-3P-8K', brand: 'SOLIS', model: 'S6-EH3P8K02-NV-YD-L', systemType: 'hybrid', phase: 3, powerKw: 8, priceVnd: 39672222 },
  { id: 'SOLIS-HYBRID-3P-10K', brand: 'SOLIS', model: 'S6-EH3P10K02-NV-YD-L', systemType: 'hybrid', phase: 3, powerKw: 10, priceVnd: 43286667 },
  { id: 'SOLIS-HYBRID-3P-12K', brand: 'SOLIS', model: 'S6-EH3P12K02-NV-YD-L', systemType: 'hybrid', phase: 3, powerKw: 12, priceVnd: 48023333 },
  { id: 'SOLIS-HYBRID-3P-15K', brand: 'SOLIS', model: 'S6-EH3P15K02-NV-YD-L', systemType: 'hybrid', phase: 3, powerKw: 15, priceVnd: 54105556 },
  { id: 'SOLIS-HYBRID-3P-18K', brand: 'SOLIS', model: 'S6-EH3P18K02-NV-YD-L', systemType: 'hybrid', phase: 3, powerKw: 18, priceVnd: 62631111 }
];

// 3. PIN LƯU TRỮ LITHIUM (BESS)
export const BATTERIES = [
  {
    id: 'DYNESS-DL5',
    brand: 'Dyness',
    model: 'DL5.0F',
    capacityKwh: 5.12,
    voltage: 51.2,
    ipRating: 'IP20',
    cycles: 8000,
    warrantyYears: 7,
    priceVnd: 21881000
  },
  {
    id: 'DYNESS-PBOX',
    brand: 'Dyness',
    model: 'PowerBox PRO',
    capacityKwh: 10.24,
    voltage: 51.2,
    ipRating: 'IP65',
    cycles: 6000,
    warrantyYears: 10,
    priceVnd: 39087000
  },
  {
    id: 'DYNESS-BRICK-SC',
    brand: 'Dyness',
    model: 'Power Brick SC',
    capacityKwh: 16.0,
    voltage: 51.2,
    ipRating: 'IP20',
    cycles: 8000,
    warrantyYears: 7,
    priceVnd: 50886000
  },
  {
    id: 'DYNESS-BRICK-PLUS',
    brand: 'Dyness',
    model: 'Power Brick PLUS',
    capacityKwh: 16.0,
    voltage: 51.2,
    ipRating: 'IP65',
    cycles: 8000,
    warrantyYears: 7,
    priceVnd: 52204000
  },
  {
    id: 'HITHIUM-HERO-16',
    brand: 'Hithium',
    model: 'Hero EE 16kWh',
    capacityKwh: 16.0,
    voltage: 51.2,
    ipRating: 'IP20',
    cycles: 6000,
    warrantyYears: 5,
    priceVnd: 48000000
  }
];