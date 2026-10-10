// src/components/CalculatorStep/RoiChartStep.jsx
import { ChevronLeft, Package, TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { generate25YearCashflow } from '../../utils/solarCalculator';

const formatVndM = (amount) => {
  if (Math.abs(amount) >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
  if (Math.abs(amount) >= 1000000) return Math.round(amount / 1000000) + 'tr';
  return Math.round(amount / 1000) + 'k';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-emerald-300 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-emerald-800 text-xs font-bold mb-2">Năm {label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex flex-col mb-1 last:mb-0">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-emerald-700">{entry.name}:</span>
            <span className={`font-bold ${entry.value >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
              {entry.value >= 0 ? '+' : ''}{formatVndM(entry.value)}đ
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RoiChartStep({ inputType = 'bill', monthlyBill, customKwp, province, result, onBack, onOpenQuote, usageProfile }) {
  const psh = province?.psh || 4.6;
  const { data } = generate25YearCashflow(inputType, monthlyBill, customKwp, psh, usageProfile);

  const ongridPayback = result.ongrid.finance.paybackYears;
  const hybridPayback = result.hybrid.finance.paybackYears;
  const ongridProfit = result.ongrid.finance.total25YearSavings;
  const hybridProfit = result.hybrid.finance.total25YearSavings;

  return (
    <div className="animate-slide-up">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-semibold">Bước 3 / 3 — Phân tích ROI</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-teal-800 mb-2">
          Dòng tiền tiết kiệm trong 25 năm
        </h2>
        <p className="text-emerald-700 text-sm max-w-lg mx-auto">
          Biểu đồ lợi nhuận ròng tích lũy sau khi trừ chi phí đầu tư ban đầu (tính suy hao tấm pin ~0.5%/năm)
        </p>
      </div>

      {/* Summary KPI cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card-dark p-4 text-center">
          <p className="text-emerald-700 text-[10px] mb-1">⚡ Hoàn vốn Hòa Lưới</p>
          <p className="text-emerald-400 text-2xl font-black">{ongridPayback}<span className="text-sm font-normal"> năm</span></p>
        </div>
        <div className="card-dark p-4 text-center">
          <p className="text-emerald-700 text-[10px] mb-1">🔋 Hoàn vốn Hybrid</p>
          <p className="text-amber-400 text-2xl font-black">{hybridPayback}<span className="text-sm font-normal"> năm</span></p>
        </div>
        <div className="card-dark p-4 text-center">
          <p className="text-emerald-700 text-[10px] mb-1">💰 Lời 25 năm (Hòa Lưới)</p>
          <p className="text-emerald-400 text-xl font-black">{formatVndM(ongridProfit)}đ</p>
        </div>
        <div className="card-dark p-4 text-center">
          <p className="text-emerald-700 text-[10px] mb-1">💎 Lời 25 năm (Hybrid)</p>
          <p className="text-amber-400 text-xl font-black">{formatVndM(hybridProfit)}đ</p>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="card-dark p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-teal-800 font-bold text-sm sm:text-base">Lợi nhuận ròng tích lũy (VNĐ)</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-emerald-600 cursor-help" />
              <div className="absolute left-0 bottom-6 z-10 hidden group-hover:block w-64 bg-emerald-100 text-xs text-emerald-800 rounded-xl p-3 shadow-xl border border-emerald-300">
                Đường ngang 0đ = điểm hoàn vốn. Khi đường vượt qua 0đ = bắt đầu có lãi ròng.
              </div>
            </div>
          </div>
          <p className="text-emerald-600 text-xs mb-4">Giá trị âm = còn đang hoàn vốn | Giá trị dương = đã có lãi</p>

          <div id="roi-chart-container" className="h-72 sm:h-96 bg-emerald-50 rounded-lg p-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ongridGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hybridGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a7f3d0" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[1, 25]}
                  ticks={[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]}
                  allowDecimals={false}
                  tickFormatter={(v) => `N${v}`}
                  tick={{ fill: '#047857', fontSize: 11 }}
                  axisLine={{ stroke: '#a7f3d0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => formatVndM(v)}
                  tick={{ fill: '#047857', fontSize: 10 }}
                  axisLine={{ stroke: '#a7f3d0' }}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-emerald-800">{value}</span>
                  )}
                />
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="6 3" strokeWidth={1.5} />
                
                <Area
                  type="monotone"
                  dataKey="ongridNet"
                  name="Hòa Lưới ST-ECO"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#ongridGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10B981' }}
                />
                <Area
                  type="monotone"
                  dataKey="hybridNet"
                  name="Hybrid ST-HYBRID"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#hybridGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#F59E0B' }}
                />
                <ReferenceDot 
                  x={ongridPayback} y={0} r={6} fill="#10B981" stroke="#fff" strokeWidth={2} isFront={true} 
                  label={{ position: 'top', value: `${ongridPayback} năm`, fill: '#047857', fontSize: 11, fontWeight: 'bold' }}
                />
                <ReferenceDot 
                  x={hybridPayback} y={0} r={6} fill="#F59E0B" stroke="#fff" strokeWidth={2} isFront={true} 
                  label={{ position: 'bottom', value: `${hybridPayback} năm`, fill: '#B45309', fontSize: 11, fontWeight: 'bold' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assumptions note */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 text-xs font-bold mb-1">Giả định tính toán</p>
            <ul className="text-emerald-700 text-xs space-y-1">
              <li>• Giá điện EVN giữ nguyên (thực tế có xu hướng tăng 3-5%/năm → lợi hơn thực tế)</li>
              <li>• Suy hao tấm pin JA Solar: ~0.5%/năm (bảo hành 80% công suất sau 25 năm)</li>
              <li>• Hệ số hiệu suất hệ thống: 80% (Performance Ratio chuẩn công nghiệp)</li>
              <li>• PSH khu vực: {psh} giờ/ngày | Không tính chi phí bảo trì (thực tế rất thấp &lt;0.5%/năm)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          id="roi-back-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={() => onOpenQuote('hybrid')}
          className="flex-1 btn-gold flex items-center justify-center gap-2 text-base"
          id="get-quote-roi-btn"
        >
          <Package className="w-5 h-5" />
          Nhận báo giá PDF chính thức
        </button>
      </div>
    </div>
  );
}
