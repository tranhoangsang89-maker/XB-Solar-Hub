// src/components/CalculatorStep/BillInputStep.jsx
import { useState, lazy, Suspense } from 'react';
import { Zap, MapPin, Clock, ChevronRight, Lightbulb, Home, Building, Satellite, CheckCircle2, Search, ChevronDown, Check, Sun } from 'lucide-react';
import { PROVINCES_PSH } from '../../data/solarData';

// Lazy-load the heavy map modal
const SatelliteRoofModal = lazy(() => import('../SatelliteRoofModal'));

const BILL_STEPS = [2000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000];
const BILL_MIN = 2000000;
const BILL_MAX = 30000000;

const USAGE_PROFILES = [
  {
    id: 'work_day',
    label: 'Đi làm ban ngày',
    desc: 'Nhà vắng ngày, dùng điện chủ yếu buổi tối',
    icon: Building,
    tag: 'Phù hợp Hòa Lưới',
    tagColor: 'emerald',
  },
  {
    id: 'home_all_day',
    label: 'Ở nhà cả ngày',
    desc: 'Người già, trẻ nhỏ hoặc làm việc tại nhà',
    icon: Home,
    tag: 'Tối ưu nhất',
    tagColor: 'amber',
  },
  {
    id: 'mixed',
    label: 'Hỗn hợp / Linh hoạt',
    desc: 'Lịch sinh hoạt không cố định, cần tối ưu 24/7',
    icon: Clock,
    tag: 'Khuyên dùng Hybrid',
    tagColor: 'blue',
  },
];

const formatVnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount) + 'đ';

const getSliderPercent = (value) =>
  ((value - BILL_MIN) / (BILL_MAX - BILL_MIN)) * 100;

export default function BillInputStep({ onNext }) {
  const [inputType, setInputType] = useState('bill'); // 'bill' | 'kwp'
  const [customKwp, setCustomKwp] = useState(5);
  const [monthlyBill, setMonthlyBill] = useState(5000000);
  const [province, setProvince] = useState(PROVINCES_PSH[0]);
  const [usageProfile, setUsageProfile] = useState('home_all_day');
  const [roofModalOpen, setRoofModalOpen] = useState(false);
  const [roofData, setRoofData] = useState(null); // { areaM2, maxPanels, maxKwp, suggestedPackage }
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');

  const filteredProvinces = PROVINCES_PSH.filter(p => 
    p.name.toLowerCase().includes(provinceSearch.toLowerCase()) ||
    (p.region && p.region.toLowerCase().includes(provinceSearch.toLowerCase()))
  );
  const handleRoofApply = (data) => {
    setRoofData(data);
  };

  const sliderPercent = getSliderPercent(monthlyBill);

  const handleSliderChange = (e) => {
    setMonthlyBill(Number(e.target.value));
  };

  const handleProvinceChange = (e) => {
    const found = PROVINCES_PSH.find((p) => p.name === e.target.value);
    if (found) setProvince(found);
  };

  const handleNext = () => {
    onNext({ inputType, customKwp, monthlyBill, province, usageProfile });
  };

  // Determine bill tier label
  const getBillTier = () => {
    if (monthlyBill <= 5000000) return { label: 'Thấp', color: 'text-blue-400' };
    if (monthlyBill <= 10000000) return { label: 'Trung bình', color: 'text-emerald-400' };
    if (monthlyBill <= 20000000) return { label: 'Cao', color: 'text-amber-400' };
    return { label: 'Rất cao', color: 'text-red-400' };
  };

  const tier = getBillTier();

  return (
    <div className="animate-slide-up">
      {/* Section title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-4">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-semibold">Bước 1 / 3</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-teal-800 mb-2">
          Thông tin tiêu thụ điện
        </h2>
        <p className="text-emerald-700 text-sm sm:text-base max-w-md mx-auto">
          Nhập hóa đơn điện hàng tháng để chúng tôi tính toán hệ thống phù hợp nhất cho bạn
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Toggle Input Type */}
        <div className="flex bg-emerald-100/50 p-1 rounded-xl mb-6 max-w-sm mx-auto">
          <button
            onClick={() => setInputType('bill')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              inputType === 'bill' ? 'bg-white text-teal-800 shadow' : 'text-emerald-700 hover:text-teal-800'
            }`}
          >
            Tính theo tiền điện
          </button>
          <button
            onClick={() => setInputType('kwp')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              inputType === 'kwp' ? 'bg-white text-teal-800 shadow' : 'text-emerald-700 hover:text-teal-800'
            }`}
          >
            Số kWp tùy chỉnh
          </button>
        </div>

        {/* Input Block */}
        <div className="card-dark p-6">
          {inputType === 'bill' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <label className="text-teal-800 font-semibold">Hóa đơn điện hàng tháng</label>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{formatVnd(monthlyBill)}</div>
                  <div className={`text-xs font-semibold ${tier.color}`}>{tier.label}</div>
                </div>
              </div>

              {/* Slider */}
              <div className="relative mb-2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 pointer-events-none"
                  style={{ width: `${sliderPercent}%`, top: '50%', transform: 'translateY(-50%)', height: '8px' }}
                />
                <input
                  type="range"
                  id="bill-slider"
                  min={BILL_MIN}
                  max={BILL_MAX}
                  step={100000}
                  value={monthlyBill}
                  onChange={handleSliderChange}
                  className="w-full relative z-10"
                  aria-label="Tiền điện hàng tháng"
                />
              </div>
              <div className="flex justify-between text-xs text-emerald-600 mt-1">
                <span>2tr</span>
                <span>10tr</span>
                <span>20tr</span>
                <span>30tr</span>
              </div>

              {/* Quick select chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[2000000, 5000000, 10000000, 15000000, 20000000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMonthlyBill(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      monthlyBill === val
                        ? 'bg-amber-500 text-teal-800 border-amber-500'
                        : 'bg-emerald-100/50 text-emerald-700 border-emerald-300 hover:border-amber-500/50 hover:text-amber-400'
                    }`}
                  >
                    {formatVnd(val).replace('đ', '')}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <label className="text-teal-800 font-semibold">Công suất hệ thống (kWp)</label>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{customKwp} kWp</div>
                </div>
              </div>

              {/* Slider kWp */}
              <div className="relative mb-2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 pointer-events-none"
                  style={{ width: `${((customKwp - 3) / (50 - 3)) * 100}%`, top: '50%', transform: 'translateY(-50%)', height: '8px' }}
                />
                <input
                  type="range"
                  min={3}
                  max={50}
                  step={1}
                  value={customKwp}
                  onChange={(e) => setCustomKwp(Number(e.target.value))}
                  className="w-full relative z-10"
                />
              </div>
              <div className="flex justify-between text-xs text-emerald-600 mt-1">
                <span>3 kWp</span>
                <span>25 kWp</span>
                <span>50 kWp</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[3, 5, 8, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCustomKwp(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                      customKwp === val
                        ? 'bg-amber-500 text-teal-800 border-amber-500'
                        : 'bg-emerald-100/50 text-emerald-700 border-emerald-300 hover:border-amber-500/50 hover:text-amber-400'
                    }`}
                  >
                    {val} kWp
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Province Selector */}
        <div className="card-dark p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <label className="text-teal-800 font-semibold">Tỉnh / Thành phố lắp đặt</label>
          </div>
          {/* Custom Searchable Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProvinceOpen(!isProvinceOpen)}
              className="w-full input-dark text-left flex items-center justify-between"
              aria-label="Chọn tỉnh thành"
            >
              <span>{province.name} — PSH: {province.psh} giờ/ngày</span>
              <ChevronDown className={`w-4 h-4 text-emerald-700 transition-transform ${isProvinceOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isProvinceOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProvinceOpen(false)}
                />
                <div className="absolute z-50 w-full mt-2 bg-white border border-emerald-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-emerald-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-700 ml-2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm tỉnh/thành phố..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      className="bg-transparent text-sm text-teal-800 focus:outline-none w-full p-2"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                    {filteredProvinces.length > 0 ? (
                      filteredProvinces.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => {
                            setProvince(p);
                            setIsProvinceOpen(false);
                            setProvinceSearch('');
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                            province.name === p.name 
                              ? 'bg-emerald-500/20 text-emerald-400 font-medium' 
                              : 'text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <span>{p.name} <span className="text-emerald-600 text-xs ml-1">({p.region})</span></span>
                          {province.name === p.name && <Check className="w-4 h-4" />}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-emerald-600 text-sm">Không tìm thấy kết quả</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-emerald-400 text-xs">
              <span className="font-bold">PSH {province.psh} giờ/ngày</span> — Chỉ số bức xạ mặt trời đỉnh tại khu vực này
            </p>
          </div>
        </div>

        {/* Usage Profile */}
        <div className="card-dark p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <label className="text-teal-800 font-semibold">Thói quen sử dụng điện</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {USAGE_PROFILES.map((profile) => {
              const Icon = profile.icon;
              const isSelected = usageProfile === profile.id;
              const tagColors = {
                emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
              };
              return (
                <button
                  key={profile.id}
                  onClick={() => setUsageProfile(profile.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-100/40 border-emerald-300 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-amber-500/20' : 'bg-emerald-200'}`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`} />
                  </div>
                  <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-teal-800' : 'text-emerald-800'}`}>
                    {profile.label}
                  </p>
                  <p className="text-xs text-emerald-600 leading-snug mb-2">{profile.desc}</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColors[profile.tagColor]}`}>
                    {profile.tag}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Satellite Roof Survey Button ────────────────────────────── */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-sm" />
          <button
            onClick={() => setRoofModalOpen(true)}
            id="open-satellite-roof-btn"
            className="relative w-full flex items-center justify-center gap-3 bg-white/80 hover:bg-emerald-100/80
              border-2 border-dashed border-blue-500/50 hover:border-blue-400 text-blue-300 hover:text-blue-200
              font-bold text-sm py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] group"
          >
            <Satellite className="w-5 h-5 group-hover:animate-pulse text-blue-400" />
            🛰️ Khảo sát diện tích mái qua vệ tinh
            <span className="text-[10px] font-normal text-blue-400/70 absolute bottom-1 right-3">Miễn phí</span>
          </button>
        </div>

        {/* Roof data badge (when applied) */}
        {roofData && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 text-xs font-bold">✅ Đã đo mái từ vệ tinh</p>
              <p className="text-emerald-800 text-xs">
                Diện tích: <span className="font-bold text-teal-800">{roofData.areaM2.toFixed(1)} m²</span> &nbsp;·&nbsp;
                Tối đa: <span className="font-bold text-amber-400">{roofData.maxPanels} tấm (~{roofData.maxKwp} kWp)</span>
              </p>
              {roofData.suggestedPackage && (
                <p className="text-emerald-700 text-[10px] mt-0.5">Gợi ý: {roofData.suggestedPackage.name}</p>
              )}
            </div>
            <button onClick={() => setRoofData(null)} className="text-emerald-600 hover:text-emerald-800 transition-colors flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleNext}
          id="calculate-btn"
          className="w-full btn-gold flex items-center justify-center gap-2 text-base py-4"
        >
          <Zap className="w-5 h-5" />
          Tính toán hệ thống phù hợp
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-center text-emerald-600 text-xs">
          🔒 Thông tin chỉ dùng để tính toán kỹ thuật — không lưu trữ hay chia sẻ
        </p>
      </div>

      {/* Satellite Roof Modal — lazy loaded */}
      <Suspense fallback={null}>
        <SatelliteRoofModal
          isOpen={roofModalOpen}
          onClose={() => setRoofModalOpen(false)}
          onApplyArea={handleRoofApply}
        />
      </Suspense>
    </div>
  );
}
