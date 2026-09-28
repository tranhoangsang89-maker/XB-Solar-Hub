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
      basePriceVnd: 36422500,
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
      basePriceVnd: 55260500,
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
      basePriceVnd: 97316000,
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
      basePriceVnd: 101260500,
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
      basePriceVnd: 148845000,
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
      basePriceVnd: 212316000,
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
