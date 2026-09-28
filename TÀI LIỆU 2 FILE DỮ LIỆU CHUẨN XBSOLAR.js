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
  { name: 'TP. Hồ Chí Minh', psh: 4.6 },
  { name: 'Tiền Giang (Mỹ Tho)', psh: 4.7 },
  { name: 'Bình Dương', psh: 4.6 },
  { name: 'Đồng Nai', psh: 4.5 },
  { name: 'Long An', psh: 4.7 },
  { name: 'Tây Ninh', psh: 4.8 },
  { name: 'Bến Tre', psh: 4.6 }
];

export const SYSTEM_COMBOS = {
  ongrid: [
    {
      id: 'XB-ECO-3K',
      name: 'Gói Tiết Kiệm XB-ECO 3kW',
      inverter: 'Sungrow SG3.0RS (1 Pha)',
      panelModel: 'JA Solar JAM66D45 LB 610W',
      panelQty: 5,
      systemCapacityKwp: 3.05,
      areaRequiredM2: 13,
      basePriceVnd: 42000000,
      description: 'Phù hợp tiền điện 1.5 - 2.5 triệu/tháng, triệt tiêu điện giờ cao điểm ngày.'
    },
    {
      id: 'XB-ECO-5K',
      name: 'Gói Tiết Kiệm XB-ECO 5kW',
      inverter: 'Sungrow SG5.0RS (1 Pha)',
      panelModel: 'JA Solar JAM66D45 LB 610W',
      panelQty: 9,
      systemCapacityKwp: 5.49,
      areaRequiredM2: 23,
      basePriceVnd: 68000000,
      description: 'Phù hợp tiền điện 2.5 - 4.5 triệu/tháng, gọt sạch bậc thang điện cao nhất.'
    },
    {
      id: 'XB-ECO-10K',
      name: 'Gói Tiết Kiệm XB-ECO 10kW',
      inverter: 'Sungrow SG10RS / SG10RT (3 Pha)',
      panelModel: 'JA Solar JAM72D42 LB 630W',
      panelQty: 16,
      systemCapacityKwp: 10.08,
      areaRequiredM2: 42,
      basePriceVnd: 125000000,
      description: 'Phù hợp tiền điện 5 - 9 triệu/tháng cho nhà phố lớn, văn phòng gia đình.'
    }
  ],
  hybrid: [
    {
      id: 'XB-HYBRID-5K',
      name: 'Gói Toàn Diện XB-HYBRID 5kW (Áp Thấp)',
      inverter: 'Sungrow MG5RL (1 Pha Hybrid)',
      battery: 'Pin Lithium Sungrow MGL060 (6.0 kWh)',
      panelModel: 'JA Solar JAM66D45 LB 610W',
      panelQty: 9,
      systemCapacityKwp: 5.49,
      areaRequiredM2: 23,
      basePriceVnd: 118000000,
      description: 'Giải pháp lưu trữ kinh tế, dùng điện mặt trời 24/7 và chống cúp điện.'
    },
    {
      id: 'XB-HYBRID-5K-PRO',
      name: 'Gói Cao Cấp XB-HYBRID 5kW (Lưu trữ lớn)',
      inverter: 'Sungrow MG6RL (1 Pha Hybrid)',
      battery: 'Pin Lithium Sungrow MBL160 (16.0 kWh)',
      panelModel: 'JA Solar JAM66D45 LB 610W',
      panelQty: 10,
      systemCapacityKwp: 6.10,
      areaRequiredM2: 26,
      basePriceVnd: 165000000,
      description: 'Lưu trữ cực lớn 16kWh, tự do chạy máy lạnh và thiết bị công suất lớn ban đêm.'
    },
    {
      id: 'XB-HYBRID-10K-3P',
      name: 'Gói Biệt Thự XB-HYBRID 10kW (3 Pha)',
      inverter: 'Sungrow MG10TL / SH10RT (3 Pha Hybrid)',
      battery: 'Pin Sungrow Cao Áp SBR096 (9.6 kWh)',
      panelModel: 'JA Solar JAM72D42 LB 630W',
      panelQty: 16,
      systemCapacityKwp: 10.08,
      areaRequiredM2: 42,
      basePriceVnd: 220000000,
      description: 'Dành riêng cho biệt thự và nhà phố 3 pha cao cấp, vận hành êm ái, an toàn tuyệt đối.'
    }
  ]
};

export const STANDARD_ACCESSORIES = [
  'Tủ điện AC/DC Solar Mersen bảo vệ chống sét lan truyền & quá dòng',
  'Bộ ngắt nhanh khẩn cấp Rapid Shutdown Sungrow SR20D-M an toàn PCCC',
  'Hệ khung ray nhôm chuyên dụng Antai/Hopergy chống ăn mòn muối biển',
  'Cáp điện DC chuyên dụng Leader/KBE 4.0mm², phụ kiện kẹp tiếp địa đạt chuẩn IEC'
];