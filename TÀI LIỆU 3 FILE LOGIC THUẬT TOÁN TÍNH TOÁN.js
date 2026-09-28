// src/utils/solarCalculator.js
import { EVN_TARIFF, SYSTEM_COMBOS } from '../data/solarData';

export function calculateEstimatedKwh(monthlyBill) {
  // Ước lượng kWh từ tiền điện theo biểu giá bậc thang nghịch đảo
  let remainingBill = monthlyBill / (1 + EVN_TARIFF.vatRate);
  let totalKwh = 0;

  const tiers = [
    { kwh: 50, price: 1893 },
    { kwh: 50, price: 1956 },
    { kwh: 100, price: 2271 },
    { kwh: 100, price: 2860 },
    { kwh: 100, price: 3197 },
    { kwh: Infinity, price: 3302 }
  ];

  for (const tier of tiers) {
    const costForTier = tier.kwh * tier.price;
    if (remainingBill > costForTier) {
      totalKwh += tier.kwh;
      remainingBill -= costForTier;
    } else {
      totalKwh += Math.round(remainingBill / tier.price);
      break;
    }
  }
  return totalKwh;
}

export function recommendCombos(monthlyBill, psh = 4.6) {
  const estimatedKwh = calculateEstimatedKwh(monthlyBill);
  
  // Nhu cầu kWp = (Sản lượng tháng) / (PSH * 30 ngày * 0.8 hệ số hiệu suất)
  const requiredKwp = estimatedKwh / (psh * 30 * 0.8);

  // Chọn gói On-grid gần nhất
  const ongridCombo = SYSTEM_COMBOS.ongrid.reduce((prev, curr) => 
    Math.abs(curr.systemCapacityKwp - requiredKwp) < Math.abs(prev.systemCapacityKwp - requiredKwp) ? curr : prev
  );

  // Chọn gói Hybrid gần nhất
  const hybridCombo = SYSTEM_COMBOS.hybrid.reduce((prev, curr) => 
    Math.abs(curr.systemCapacityKwp - requiredKwp) < Math.abs(prev.systemCapacityKwp - requiredKwp) ? curr : prev
  );

  // Tính số tiền tiết kiệm ước tính hàng tháng (cắt từ bậc cao nhất)
  const calculateSavings = (combo, isHybrid = false) => {
    const monthlyGen = combo.systemCapacityKwp * psh * 30 * 0.8;
    // Tự dùng: On-grid ~65% tiêu thụ ngày, Hybrid ~90% cả ngày lẫn đêm
    const effectiveFactor = isHybrid ? 0.90 : 0.65;
    const utilizedKwh = Math.min(estimatedKwh * effectiveFactor, monthlyGen);
    // Giá điện bậc cao nhất ước tính ~3.300đ (đã gồm VAT)
    const monthlySavingVnd = Math.round(utilizedKwh * 3300);
    const paybackYears = Number((combo.basePriceVnd / (monthlySavingVnd * 12)).toFixed(1));

    return {
      monthlyGenerationKwh: Math.round(monthlyGen),
      monthlySavingVnd,
      paybackYears,
      total25YearSavingsVnd: Math.round(monthlySavingVnd * 12 * 25 * 0.92) // tính suy hao trung bình tấm pin
    };
  };

  return {
    estimatedKwh,
    requiredKwp: Number(requiredKwp.toFixed(2)),
    ongrid: {
      combo: ongridCombo,
      finance: calculateSavings(ongridCombo, false)
    },
    hybrid: {
      combo: hybridCombo,
      finance: calculateSavings(hybridCombo, true)
    }
  };
}