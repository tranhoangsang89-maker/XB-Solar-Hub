// src/utils/solarCalculator.js
import { EVN_TARIFF, SYSTEM_COMBOS, getCustomCombos } from '../data/solarData';

// 1. Phân rã kWh theo từng bậc thang điện lực EVN
export function decomposeEvnBill(monthlyBill) {
  let netBill = monthlyBill / (1 + EVN_TARIFF.vatRate);
  let remainingBill = netBill;
  
  const tiers = [
    { name: 'Bậc 1', maxKwh: 50, price: 1893, kwh: 0, cost: 0 },
    { name: 'Bậc 2', maxKwh: 50, price: 1956, kwh: 0, cost: 0 },
    { name: 'Bậc 3', maxKwh: 100, price: 2271, kwh: 0, cost: 0 },
    { name: 'Bậc 4', maxKwh: 100, price: 2860, kwh: 0, cost: 0 },
    { name: 'Bậc 5', maxKwh: 100, price: 3197, kwh: 0, cost: 0 },
    { name: 'Bậc 6', maxKwh: Infinity, price: 3302, kwh: 0, cost: 0 }
  ];

  let totalKwh = 0;
  for (const t of tiers) {
    const tierCapacityCost = t.maxKwh * t.price;
    if (remainingBill > tierCapacityCost) {
      t.kwh = t.maxKwh;
      t.cost = tierCapacityCost;
      totalKwh += t.kwh;
      remainingBill -= tierCapacityCost;
    } else {
      t.kwh = Math.round(remainingBill / t.price);
      t.cost = remainingBill;
      totalKwh += t.kwh;
      remainingBill = 0;
      break;
    }
  }

  return { totalKwh, tiers };
}

// 2. Thuật toán gọt ngược bậc thang điện để tính số tiền tiết kiệm chính xác
export function calculateSavingsFromKwh(totalKwh, solarUsedKwh) {
  // Bóc tách biểu giá gốc
  const { tiers } = decomposeEvnBill(totalKwh * 3000); // Tạm tính phân bổ bậc
  
  // Tính tiền điện khi KHÔNG có mặt trời
  let billWithoutSolar = 0;
  let tempTotal = totalKwh;
  const tiersWithout = [
    { kwh: Math.min(50, Math.max(0, tempTotal)), price: 1893 },
    { kwh: Math.min(50, Math.max(0, tempTotal - 50)), price: 1956 },
    { kwh: Math.min(100, Math.max(0, tempTotal - 100)), price: 2271 },
    { kwh: Math.min(100, Math.max(0, tempTotal - 200)), price: 2860 },
    { kwh: Math.min(100, Math.max(0, tempTotal - 300)), price: 3197 },
    { kwh: Math.max(0, tempTotal - 400), price: 3302 }
  ];
  billWithoutSolar = tiersWithout.reduce((sum, t) => sum + t.kwh * t.price, 0) * (1 + EVN_TARIFF.vatRate);

  // Tiền điện sau khi được điện mặt trời gọt tải (cắt từ bậc cao nhất trở xuống)
  const remainingKwh = Math.max(0, totalKwh - solarUsedKwh);
  const tiersWith = [
    { kwh: Math.min(50, Math.max(0, remainingKwh)), price: 1893 },
    { kwh: Math.min(50, Math.max(0, remainingKwh - 50)), price: 1956 },
    { kwh: Math.min(100, Math.max(0, remainingKwh - 100)), price: 2271 },
    { kwh: Math.min(100, Math.max(0, remainingKwh - 200)), price: 2860 },
    { kwh: Math.min(100, Math.max(0, remainingKwh - 300)), price: 3197 },
    { kwh: Math.max(0, remainingKwh - 400), price: 3302 }
  ];
  const billWithSolar = tiersWith.reduce((sum, t) => sum + t.kwh * t.price, 0) * (1 + EVN_TARIFF.vatRate);

  const monthlySavings = Math.round(billWithoutSolar - billWithSolar);
  return Math.max(0, monthlySavings);
}

// 3. Hàm đề xuất thông minh toàn diện
export function recommendCombos(inputType = 'bill', monthlyBill = 0, customKwp = 5, psh = 4.6, usageHabit = 'home_all_day') {
  let totalKwh = 0;
  let dailyKwh = 0;
  
  if (inputType === 'bill') {
    totalKwh = decomposeEvnBill(monthlyBill).totalKwh;
    dailyKwh = totalKwh / 30;
  } else {
    // Nếu chọn customKwp, ước tính họ dùng điện đủ bằng hoặc hơn sản lượng sinh ra
    // Sản lượng TB: customKwp * psh * 30. Giả định họ dùng mức đó
    totalKwh = customKwp * psh * 30 * 1.1; // +10% để có tiền điện gốc lớn hơn
    dailyKwh = totalKwh / 30;
  }

  // Xác định tỷ trọng điện ngày/đêm theo thói quen thực tế
  let dayRatio = 0.55;  // Mặc định ở nhà cả ngày
  if (usageHabit === 'work_day') dayRatio = 0.30;       // Đi làm cả ngày
  if (usageHabit === 'mixed_business') dayRatio = 0.70; // Kinh doanh / Buôn bán ngày

  const dayConsumptionKwh = dailyKwh * dayRatio;
  const nightConsumptionKwh = dailyKwh * (1 - dayRatio);

  let ongridCombo;
  let hybridCombo;

  if (inputType === 'kwp') {
    const custom = getCustomCombos(customKwp);
    ongridCombo = custom.ongridCombo;
    hybridCombo = custom.hybridCombo;
  } else {
    // A. Tính toán tối ưu cho HÒA LƯỚI (Zero-Export)
    const optimalOngridKwp = Math.max(3, dayConsumptionKwh / (psh * 0.85));
    
    const closestOngrid = SYSTEM_COMBOS.ongrid.reduce((prev, curr) => 
      Math.abs(curr.systemCapacityKwp - optimalOngridKwp) < Math.abs(prev.systemCapacityKwp - optimalOngridKwp) ? curr : prev
    );

    if (Math.abs(closestOngrid.systemCapacityKwp - optimalOngridKwp) / optimalOngridKwp < 0.15) {
      ongridCombo = closestOngrid;
    } else {
      ongridCombo = getCustomCombos(optimalOngridKwp).ongridCombo;
      ongridCombo.name = `Gói Hòa Lưới Tối Ưu ${ongridCombo.systemCapacityKwp}kWp`;
      ongridCombo.description = `Cấu hình được thiết kế tự động phù hợp với nhu cầu điện của bạn.`;
    }

    // B. Tính toán tối ưu cho HYBRID (Có Pin Lưu Trữ)
    const targetBatteryKwh = dailyKwh > 30 ? (dailyKwh * 0.3) : (dailyKwh > 18 ? 9.6 : 6.0);
    const optimalHybridKwp = Math.max(5, (dayConsumptionKwh + targetBatteryKwh) / (psh * 0.82));
    
    const closestHybrid = SYSTEM_COMBOS.hybrid.reduce((prev, curr) => 
      Math.abs(curr.systemCapacityKwp - optimalHybridKwp) < Math.abs(prev.systemCapacityKwp - optimalHybridKwp) ? curr : prev
    );

    if (Math.abs(closestHybrid.systemCapacityKwp - optimalHybridKwp) / optimalHybridKwp < 0.15) {
      hybridCombo = closestHybrid;
    } else {
      hybridCombo = getCustomCombos(optimalHybridKwp).hybridCombo;
      hybridCombo.name = `Gói Lưu Trữ Toàn Diện ${hybridCombo.systemCapacityKwp}kWp`;
      hybridCombo.description = `Hệ thống Hybrid tự động tối ưu cho nhu cầu sử dụng cả ngày lẫn đêm.`;
    }
  }

  // Tính toán chỉ số của On-grid
  const ongridMonthlyGen = ongridCombo.systemCapacityKwp * psh * 30 * 0.80;
  const ongridEffectiveFactor = usageHabit === 'work_day' ? 0.45 : (usageHabit === 'mixed_business' ? 0.85 : 0.65);
  const ongridUsableKwh = Math.min(ongridMonthlyGen * ongridEffectiveFactor, totalKwh * dayRatio);
  const ongridSavings = calculateSavingsFromKwh(totalKwh, ongridUsableKwh);

  // Tính toán chỉ số của Hybrid
  const hybridMonthlyGen = hybridCombo.systemCapacityKwp * psh * 30 * 0.80;
  
  // Trích xuất dung lượng pin từ chuỗi tên pin
  const batMatch = hybridCombo.battery.match(/\(([\d.]+)\s*kWh\)/);
  const singleBatCap = batMatch ? parseFloat(batMatch[1]) : 16;
  const totalBatteryKwh = singleBatCap * (hybridCombo.batteryQty || 1);

  const dailyGen = hybridMonthlyGen / 30;
  // Dùng trực tiếp ban ngày (tối đa bằng 60% sản lượng sinh ra hoặc tổng nhu cầu ban ngày)
  const dailyDirectUse = Math.min(dailyGen * 0.6, dayConsumptionKwh);
  // Điện dư dồn vào bình
  const dailyExcess = Math.max(0, dailyGen - dailyDirectUse);
  // Điện xả từ bình dùng ban đêm (bị giới hạn bởi lượng dư, dung lượng bình thực tế 90% DoD, và nhu cầu ban đêm)
  const dailyBatteryUse = Math.min(dailyExcess * 0.95, totalBatteryKwh * 0.9, nightConsumptionKwh);
  
  const hybridUsableKwh = (dailyDirectUse + dailyBatteryUse) * 30;
  const hybridSavings = calculateSavingsFromKwh(totalKwh, hybridUsableKwh);

  // C. Tính chỉ số tài chính ROI & Hoàn vốn
  const getRoi = (combo, monthlySavings) => {
    const annualSavings = monthlySavings * 12;
    const paybackYears = Number((combo.basePriceVnd / annualSavings).toFixed(1));
    // 25 năm tính suy hao pin 0.5%/năm
    const total25YearSavings = Math.round(annualSavings * 25 * 0.92 - combo.basePriceVnd);
    return {
      monthlySavings,
      paybackYears,
      total25YearSavings
    };
  };

  return {
    estimatedKwh: totalKwh,
    dailyKwh: Number(dailyKwh.toFixed(1)),
    dayConsumptionKwh: Number(dayConsumptionKwh.toFixed(1)),
    nightConsumptionKwh: Number(nightConsumptionKwh.toFixed(1)),
    recommendedKwp: Number((inputType === 'kwp' ? customKwp : hybridCombo.systemCapacityKwp).toFixed(2)),
    ongrid: {
      combo: ongridCombo,
      monthlyGenKwh: Math.round(ongridMonthlyGen),
      usableKwh: Math.round(ongridUsableKwh),
      finance: getRoi(ongridCombo, ongridSavings)
    },
    hybrid: {
      combo: hybridCombo,
      monthlyGenKwh: Math.round(hybridMonthlyGen),
      usableKwh: Math.round(hybridUsableKwh),
      finance: getRoi(hybridCombo, hybridSavings)
    }
  };
}

export function generate25YearCashflow(inputType, monthlyBill, customKwp, psh = 4.6, usageHabit = 'home_all_day') {
  const result = recommendCombos(inputType, monthlyBill, customKwp, psh, usageHabit);
  const ongridPrice = result.ongrid.combo.basePriceVnd;
  const hybridPrice = result.hybrid.combo.basePriceVnd;
  const ongridMonthlySaving = result.ongrid.finance.monthlySavings;
  const hybridMonthlySaving = result.hybrid.finance.monthlySavings;

  const data = [];
  for (let year = 1; year <= 25; year++) {
    const degradationFactor = Math.pow(0.995, year); // suy hao 0.5%/năm
    const ongridCumSaving = Math.round(ongridMonthlySaving * 12 * year * degradationFactor);
    const hybridCumSaving = Math.round(hybridMonthlySaving * 12 * year * degradationFactor);
    data.push({
      year,
      ongridNet: ongridCumSaving - ongridPrice,
      hybridNet: hybridCumSaving - hybridPrice,
      ongridCum: ongridCumSaving,
      hybridCum: hybridCumSaving,
    });
  }
  return { data, result };
}
