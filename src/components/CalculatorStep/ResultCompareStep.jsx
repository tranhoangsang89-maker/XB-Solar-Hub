// src/components/CalculatorStep/ResultCompareStep.jsx
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, Battery, Sun, TrendingUp, DollarSign, Clock, Package, CheckCircle2, Box } from 'lucide-react';
import { STANDARD_ACCESSORIES } from '../../data/solarData';
import Solar3DViewer from '../Solar3DViewer';

const formatVnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount);

const formatVndM = (amount) => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
  if (amount >= 1000000) return (amount / 1000000).toFixed(0) + ' triệu';
  return formatVnd(amount) + 'đ';
};

function StatCard({ icon: Icon, label, value, color = 'amber' }) {
  const colors = {
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
  };
  return (
    <div className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] leading-tight mb-0.5">{label}</p>
        <p className={`font-bold text-sm ${colors[color].split(' ')[0]}`}>{value}</p>
      </div>
    </div>
  );
}

function ComboCard({ type, plan, recommended, onSelect, isSelected }) {
  const { combo, finance, monthlyGenKwh, usableKwh } = plan;
  const isHybrid = type === 'hybrid';
  const accentColor = isHybrid ? 'amber' : 'emerald';
  const gradientFrom = isHybrid ? 'from-amber-500/15' : 'from-emerald-500/15';
  const borderColor = isHybrid ? 'border-amber-500' : 'border-emerald-500';
  const borderInactive = isHybrid ? 'border-amber-500/30' : 'border-emerald-500/30';
  const tagBg = isHybrid ? 'bg-amber-500' : 'bg-emerald-500';
  const tagText = isHybrid ? 'text-slate-900' : 'text-white';
  const iconColor = isHybrid ? 'text-amber-400' : 'text-emerald-400';
  const iconBg = isHybrid ? 'bg-amber-500/20' : 'bg-emerald-500/20';

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer
        bg-gradient-to-b ${gradientFrom} to-slate-800/60
        ${isSelected ? `${borderColor} shadow-lg` : `${borderInactive} hover:border-opacity-60`}
        hover:scale-[1.01]`}
      onClick={onSelect}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tagBg} ${tagText} text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap`}>
          ⭐ {isHybrid ? 'Toàn Diện Nhất' : 'Tiết Kiệm Nhất'}
        </div>
      )}

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {isHybrid ? (
              <Battery className={`w-5 h-5 ${iconColor}`} />
            ) : (
              <Zap className={`w-5 h-5 ${iconColor}`} />
            )}
          </div>
          <div>
            <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${isHybrid ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isHybrid ? 'XB-HYBRID Sungrow + Pin BESS' : 'XB-ECO Hòa Lưới'}
            </div>
            <h3 className="text-white font-bold text-base leading-tight">{combo.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed mb-4 border-l-2 border-slate-600 pl-3">
          {combo.description}
        </p>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard icon={Sun} label="Công suất" value={`${combo.systemCapacityKwp} kWp`} color={accentColor} />
          <StatCard icon={Package} label="Tấm pin" value={`${combo.panelQty} tấm`} color={accentColor} />
          <StatCard icon={Zap} label="Sản lượng/tháng" value={`${formatVnd(monthlyGenKwh)} kWh`} color={accentColor} />
          <StatCard icon={DollarSign} label="Tiết kiệm/tháng" value={`~${formatVndM(finance.monthlySavings)}`} color={accentColor} />
        </div>

        {/* Battery info (hybrid only) */}
        {isHybrid && combo.battery && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-amber-300/70 font-medium">Lưu trữ BESS</p>
                <p className="text-amber-300 text-xs font-bold">{combo.battery}</p>
              </div>
            </div>
          </div>
        )}

        {/* Inverter */}
        <div className="bg-slate-700/40 rounded-lg px-3 py-2 mb-4">
          <p className="text-[10px] text-slate-500 mb-0.5">Inverter</p>
          <p className="text-slate-300 text-xs font-semibold">{combo.inverter}</p>
        </div>

        {/* Financial highlights */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={`rounded-xl p-3 text-center ${isHybrid ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <Clock className={`w-4 h-4 mx-auto mb-1 ${iconColor}`} />
            <p className="text-slate-400 text-[10px]">Hoàn vốn</p>
            <p className={`font-black text-lg ${iconColor}`}>{finance.paybackYears}<span className="text-xs font-normal"> năm</span></p>
          </div>
          <div className={`rounded-xl p-3 text-center ${isHybrid ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <TrendingUp className={`w-4 h-4 mx-auto mb-1 ${iconColor}`} />
            <p className="text-slate-400 text-[10px]">Lời 25 năm</p>
            <p className={`font-black text-sm ${iconColor}`}>{formatVndM(finance.total25YearSavings)}</p>
          </div>
        </div>

        {/* Price */}
        <div className={`rounded-xl p-4 mb-4 text-center ${isHybrid ? 'bg-gradient-to-r from-amber-600/20 to-amber-500/10 border border-amber-500/30' : 'bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30'}`}>
          <p className="text-slate-400 text-xs mb-1">Giá trọn gói (chưa VAT)</p>
          <p className={`text-2xl font-black ${iconColor}`}>
            {formatVndM(combo.basePriceVnd)}
          </p>
          <p className="text-slate-500 text-[10px] mt-1">Đã bao gồm vật tư + thi công + bảo hành</p>
        </div>

        {/* Select button */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
            isSelected
              ? isHybrid
                ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {isSelected ? '✓ Đã chọn gói này' : 'Chọn gói này'}
        </button>
      </div>
    </div>
  );
}

export default function ResultCompareStep({ result, onNext, onBack, onOpenQuote }) {
  const [selectedType, setSelectedType] = useState('hybrid');
  const [show3DViewer, setShow3DViewer] = useState(false);

  // Determine recommendation
  const recommendHybrid = result.ongrid.finance.paybackYears > 5;

  return (
    <div className="animate-slide-up">
      {/* Section title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-semibold">Bước 2 / 3 — Kết quả phân tích</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          So sánh 2 gói phù hợp nhất
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto mb-5">
          Dựa trên hóa đơn điện và vị trí của bạn, đây là 2 phương án tối ưu nhất mà XB Solar đề xuất
        </p>
        <button
          onClick={() => setShow3DViewer(true)}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-amber-500/10"
        >
          <Box className="w-4 h-4" /> Xem mô phỏng 3D trên mái
        </button>
      </div>

      {/* Summary banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-wrap gap-4 justify-center sm:justify-start">
          <div className="text-center">
            <p className="text-slate-500 text-xs">Tiêu thụ ước tính</p>
            <p className="text-white font-bold">{formatVnd(result.estimatedKwh)} kWh/tháng</p>
          </div>
          <div className="w-px bg-slate-700 hidden sm:block" />
          <div className="text-center">
            <p className="text-slate-500 text-xs">Cần công suất</p>
            <p className="text-white font-bold">{result.recommendedKwp} kWp</p>
          </div>
          <div className="w-px bg-slate-700 hidden sm:block" />
          <div className="text-center">
            <p className="text-slate-500 text-xs">Mô hình phù hợp</p>
            <p className="text-amber-400 font-bold">{recommendHybrid ? 'Hybrid + Pin BESS' : 'Hòa Lưới / Hybrid'}</p>
          </div>
        </div>
      </div>

      {/* Compare Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <ComboCard
          type="ongrid"
          plan={result.ongrid}
          recommended={!recommendHybrid}
          isSelected={selectedType === 'ongrid'}
          onSelect={() => setSelectedType('ongrid')}
        />
        <ComboCard
          type="hybrid"
          plan={result.hybrid}
          recommended={recommendHybrid}
          isSelected={selectedType === 'hybrid'}
          onSelect={() => setSelectedType('hybrid')}
        />
      </div>

      {/* Accessories included */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="card-dark p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-white font-bold text-sm">Phụ kiện & Thiết bị tiêu chuẩn (đã bao gồm)</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STANDARD_ACCESSORIES.map((acc, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0 mt-1.5" />
                {acc}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200 sm:w-auto"
          id="result-back-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          Nhập lại
        </button>
        <button
          onClick={onNext}
          className="flex-1 btn-emerald flex items-center justify-center gap-2"
          id="view-roi-btn"
        >
          <TrendingUp className="w-5 h-5" />
          Xem biểu đồ hoàn vốn 25 năm
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onOpenQuote(selectedType)}
          className="flex-1 btn-gold flex items-center justify-center gap-2"
          id="get-quote-btn"
        >
          <Package className="w-5 h-5" />
          Nhận báo giá PDF
        </button>
      </div>

      {/* 3D Viewer Modal */}
      {show3DViewer && (
        <Solar3DViewer 
          initialPanelQty={result[selectedType].combo.panelQty || 16}
          onClose={() => setShow3DViewer(false)} 
        />
      )}
    </div>
  );
}
