// src/components/QuoteModal.jsx
import { useState, useEffect } from 'react';
import { X, Download, User, Phone, Shield, Loader2, CheckCircle, FileText, Settings, Edit3 } from 'lucide-react';
import { exportQuotePDF } from '../utils/pdfExport';
import * as htmlToImage from 'html-to-image';
import { generate25YearCashflow } from '../utils/solarCalculator';
import { SOLAR_PANELS, INVERTERS, BATTERIES } from '../data/bang-gia-thiet-bi';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';

const formatVnd = (amount) => new Intl.NumberFormat('vi-VN').format(amount);
const formatVndM = (amount) => {
  if (Math.abs(amount) >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
  if (Math.abs(amount) >= 1000000) return Math.round(amount / 1000000) + 'tr';
  return Math.round(amount / 1000) + 'k';
};

export default function QuoteModal({ isOpen, onClose, result, selectedType, inputType, customKwp, monthlyBill, province }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [bomItems, setBomItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const panelOptions = SOLAR_PANELS.map(p => ({
    name: `Tấm pin ${p.brand} ${p.model} ${p.wattage}W`,
    price: p.priceVnd
  }));

  const inverterOptions = INVERTERS
    .filter(i => selectedType === 'hybrid' ? i.systemType === 'hybrid' : i.systemType === 'ongrid')
    .map(i => ({
      name: `Inverter ${i.brand} ${i.model} (${i.powerKw}kW)`,
      price: i.priceVnd
    }));

  const batteryOptions = BATTERIES.map(b => ({
    name: `Pin lưu trữ ${b.brand} ${b.model} (${b.capacityKwh} kWh)`,
    price: b.priceVnd
  }));

  useEffect(() => {
    if (!isOpen || !result) return;
    const plan = result[selectedType || 'hybrid'];
    const combo = plan.combo;
    const kwp = combo.systemCapacityKwp;
    
    const getInverterPrice = (id, name) => {
      if (id) {
        const found = INVERTERS.find(i => i.id === id);
        if (found) return found.priceVnd;
      }
      if (name.includes('SG3.0RS')) return 11500000;
      if (name.includes('SG5.0RS')) return 14000000;
      if (name.includes('SG10')) return 25000000;
      if (name.includes('MG5RL')) return 25000000;
      if (name.includes('MG6RL')) return 28500000;
      if (name.includes('MG10TL') || name.includes('SH10RT')) return 55000000;
      return 15000000;
    };

    const getBatteryPrice = (id, name) => {
      if (!name && !id) return 0;
      if (id) {
        const found = BATTERIES.find(b => b.id === id);
        if (found) return found.priceVnd;
      }
      if (name.includes('MGL060')) return 35000000;
      if (name.includes('MBL160')) return 75000000;
      if (name.includes('SBR096')) return 85000000;
      return 35000000;
    };
    
    const getPanelPrice = (id) => {
      if (id) {
        const found = SOLAR_PANELS.find(p => p.id === id);
        if (found) return found.priceVnd;
      }
      return 2600000;
    };

    const panelPrice = getPanelPrice(combo.panelId);
    const inverterPrice = getInverterPrice(combo.inverterId, combo.inverter);
    const batteryPrice = getBatteryPrice(combo.batteryId, combo.battery);
    
    // Phụ trợ tính theo quy mô
    const tuDienPrice = kwp <= 8 ? 4500000 : 6500000;
    const khunGiaPrice = combo.panelQty * 450000;
    const dayDanPrice = Math.round(kwp * 650000);
    const vanChuyenPrice = Math.round(kwp * 800000); // Nhân công & vận chuyển

    const initialItems = [
      { id: 'panel', name: `Tấm pin ${combo.panelModel}`, unit: 'Tấm', qty: combo.panelQty, price: panelPrice, total: combo.panelQty * panelPrice, editableQty: true, editableName: true, image: '/tam-pin-jasolar.png' },
      { id: 'inverter', name: `Inverter ${combo.inverter}`, unit: 'Bộ', qty: combo.inverterQty || 1, price: inverterPrice, total: (combo.inverterQty || 1) * inverterPrice, editableQty: true, editableName: true, image: '/inverter-5kw.png' },
    ];
    
    if (selectedType === 'hybrid') {
      initialItems.push({ id: 'battery', name: `Pin lưu trữ ${combo.battery}`, unit: 'Pack', qty: combo.batteryQty || 1, price: batteryPrice, total: (combo.batteryQty || 1) * batteryPrice, editableQty: true, editableName: true, image: '/pin-luu-tru-6kwh.png' });
    }
    
    initialItems.push(
      { id: 'tuDien', name: 'Tủ điện AC/DC Solar Mersen', unit: 'Bộ', qty: 1, price: tuDienPrice, total: tuDienPrice, editableQty: false, editableName: true, image: '/tu-dien.png' },
      { id: 'vatTu', name: 'Hệ khung ray nhôm chuyên dụng', unit: 'Bộ', qty: 1, price: khunGiaPrice, total: khunGiaPrice, editableQty: false, editableName: true, image: '/he-khung-ray-nhom.jpg' },
      { id: 'dayDan', name: 'Cáp điện DC & dây tiếp địa', unit: 'Hệ', qty: 1, price: dayDanPrice, total: dayDanPrice, editableQty: false, editableName: true, image: '/day-cap.jpg' },
      { id: 'vanChuyen', name: 'Nhân công lắp đặt trọn gói', unit: 'Gói', qty: 1, price: vanChuyenPrice, total: vanChuyenPrice, editableQty: false, editableName: true, image: '/nhan-cong-lap-dat.jpg' }
    );
    
    setBomItems(initialItems);
    setIsDone(false);
  }, [isOpen, result, selectedType]);

  const handleItemChange = (id, field, value) => {
    setBomItems(prev => {
      let updatedItems = prev.map(item => {
        if (item.id === id) {
          if (field === 'full_update') {
            const updated = { ...item, name: value.name, price: value.price };
            updated.total = updated.qty * updated.price;
            return updated;
          }
          if (field === 'name') {
            return { ...item, name: value };
          }
          let numVal = 0;
          if (field === 'price') {
              numVal = parseInt(value.toString().replace(/[^0-9]/g, '')) || 0;
          } else {
              numVal = parseInt(value) || 0;
          }
          const updated = { ...item, [field]: numVal };
          updated.total = updated.qty * updated.price;
          return updated;
        }
        return item;
      });

      // Tự động tính toán lại vật tư phụ khi thay đổi Pin hoặc Inverter
      if (id === 'panel' || id === 'inverter') {
        const panelItem = updatedItems.find(i => i.id === 'panel');
        const inverterItem = updatedItems.find(i => i.id === 'inverter');
        
        if (panelItem) {
          const match = panelItem.name.match(/(\d+)W/);
          const wattage = match ? parseInt(match[1]) : 720;
          const newKwp = (panelItem.qty * wattage) / 1000;
          
          updatedItems = updatedItems.map(item => {
            if (item.id === 'vatTu' && id === 'panel') {
              item.price = panelItem.qty * 450000;
              item.total = item.qty * item.price;
            }
            if (item.id === 'dayDan' && id === 'panel') {
              item.price = Math.round(newKwp * 650000);
              item.total = item.qty * item.price;
            }
            if (item.id === 'vanChuyen' && id === 'panel') {
              item.price = Math.round(newKwp * 800000);
              item.total = item.qty * item.price;
            }
            if (item.id === 'tuDien') {
              if (inverterItem) item.qty = inverterItem.qty; // 1 inverter đi kèm 1 tủ điện
              if (id === 'panel') {
                item.price = newKwp <= 8 ? 4500000 : 6500000; // Tủ công suất lớn đắt hơn
              }
              item.total = item.qty * item.price;
            }
            return item;
          });
        }
      }

      return updatedItems;
    });
  };

  const totalPrice = bomItems.reduce((sum, item) => sum + item.total, 0);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0|\+84)[0-9]{8,10}$/.test(phone.replace(/\s/g, ''))) {
      errs.phone = 'Số điện thoại không hợp lệ';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    try {
      let chartImageBase64 = null;
      // Use the hidden chart specifically rendered without animations
      const chartEl = document.getElementById('hidden-roi-chart');
      if (chartEl) {
        chartImageBase64 = await htmlToImage.toPng(chartEl, { 
          backgroundColor: '#ecfdf5',
          pixelRatio: 2
        });
      }

      await exportQuotePDF({
        customerName: name,
        customerPhone: phone,
        result,
        selectedType,
        monthlyBill: inputType === 'kwp' ? 'Nhu cầu tùy chỉnh' : monthlyBill,
        province: province?.name,
        bomItems,
        totalPrice,
        chartImageBase64
      });
      setIsDone(true);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Có lỗi khi xuất PDF. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setErrors({});
    setIsDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-emerald-50 border border-emerald-200 rounded-3xl shadow-2xl animate-slide-up flex flex-col overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 flex-shrink-0" />
        
        <div className="px-6 py-4 border-b border-emerald-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-teal-800 font-black text-lg leading-tight">Tùy chỉnh Bảng Dự Toán</h2>
              <p className="text-emerald-700 text-xs">Chỉnh sửa số lượng, đơn giá trước khi xuất PDF</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 bg-white hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {!isDone ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cột 1: BoM Table (chiếm 2 cột) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-emerald-800 font-bold text-sm">Danh Mục Vật Tư - Thiết Bị</h3>
                </div>
                
                <div className="bg-white/50 rounded-xl overflow-x-auto border border-emerald-200/50">
                  <table className="w-full text-left text-sm text-emerald-800">
                    <thead className="bg-white text-emerald-700 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Hạng mục</th>
                        <th className="px-4 py-3 text-center">ĐVT</th>
                        <th className="px-4 py-3 text-center">SL</th>
                        <th className="px-4 py-3 text-right">Đơn giá (VNĐ)</th>
                        <th className="px-4 py-3 text-right rounded-tr-xl">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {bomItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-emerald-100/20 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border border-emerald-200 hidden sm:block" />
                              )}
                              <div className="relative flex-1">
                                {item.editableName ? (
                                  <>
                                    <input
                                      type="text"
                                      value={item.name}
                                      onFocus={() => setActiveDropdown(item.id)}
                                      onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                      className="w-full bg-emerald-50 border border-emerald-300 rounded px-2 py-1.5 text-teal-800 focus:border-amber-500 focus:outline-none min-w-[150px]"
                                    />
                                    {activeDropdown === item.id && (item.id === 'panel' || item.id === 'inverter' || item.id === 'battery') && (
                                      <div className="absolute top-full left-0 mt-1 w-max min-w-full bg-white border border-emerald-300 rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                                        {(item.id === 'panel' ? panelOptions : item.id === 'inverter' ? inverterOptions : batteryOptions).map((opt, i) => (
                                          <div
                                            key={i}
                                            className="px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-100 hover:text-teal-800 cursor-pointer transition-colors flex justify-between gap-4"
                                            onClick={() => {
                                              handleItemChange(item.id, 'full_update', opt);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            <span>{opt.name}</span>
                                            <span className="font-semibold text-emerald-600">{formatVnd(opt.price)}đ</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span>{item.name}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-emerald-700">{item.unit}</td>
                          <td className="px-4 py-3 text-center">
                            {item.editableQty ? (
                              <input 
                                type="number" 
                                min="0" 
                                value={item.qty} 
                                onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                className="w-16 bg-emerald-50 border border-emerald-300 rounded px-2 py-1 text-center text-teal-800 focus:border-amber-500 focus:outline-none"
                              />
                            ) : (
                              item.qty
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input 
                              type="text" 
                              value={formatVnd(item.price)} 
                              onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                              className="w-28 bg-emerald-50 border border-emerald-300 rounded px-2 py-1 text-right text-teal-800 focus:border-amber-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                            {formatVnd(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-white font-bold">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right text-teal-800 rounded-bl-xl">TỔNG CỘNG (Chưa VAT):</td>
                        <td className="px-4 py-3 text-right text-amber-400 text-base rounded-br-xl">{formatVnd(totalPrice)} đ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Cột 2: Form & Submit (chiếm 1 cột) */}
              <div className="bg-white/30 rounded-2xl p-5 border border-emerald-200/50 h-fit">
                <h3 className="text-teal-800 font-bold mb-4">Thông tin khách hàng</h3>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-emerald-800 text-sm font-semibold mb-1.5">Họ và tên <span className="text-amber-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                        placeholder="Nguyễn Văn A"
                        className={`input-dark pl-10 ${errors.name ? 'border-rose-500' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-emerald-800 text-sm font-semibold mb-1.5">SĐT / Zalo <span className="text-amber-400">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
                        placeholder="0984807679"
                        className={`input-dark pl-10 ${errors.phone ? 'border-rose-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="flex items-start gap-2 bg-white rounded-xl p-3">
                    <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-700 text-xs leading-relaxed">
                      Thông tin sẽ được chèn trực tiếp vào báo giá PDF.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-gold flex items-center justify-center gap-2 text-base py-4 disabled:opacity-70 mt-4"
                  >
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Đang tạo PDF...</> : <><Download className="w-5 h-5" />Xuất Báo Giá PDF</>}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 max-w-md mx-auto">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-teal-800 font-black text-2xl mb-3">Xuất PDF thành công! 🎉</h3>
              <p className="text-emerald-700 text-sm mb-8">
                Bảng dự toán chi tiết đã được tải về máy của bạn. Bạn có thể gửi ngay cho khách hàng hoặc lưu trữ.
              </p>
              <button onClick={handleClose} className="btn-emerald w-full py-4 text-base">Đóng cửa sổ</button>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden chart for PDF generation */}
      {isOpen && result && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '800px', height: '400px', zIndex: -1 }}>
          <div id="hidden-roi-chart" className="w-full h-full bg-emerald-50 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={(() => {
                  const plan = result[selectedType];
                  const panelItem = bomItems.find(i => i.id === 'panel');
                  let finalGen = plan.monthlyGenKwh;
                  if (panelItem) {
                    const match = panelItem.name.match(/(\d+)W/);
                    const wattage = match ? parseInt(match[1]) : 720;
                    const currentKwp = (panelItem.qty * wattage) / 1000;
                    if (Math.abs(currentKwp - plan.combo.systemCapacityKwp) > 0.1) {
                      finalGen = currentKwp * (province?.psh || 4.6) * 30 * 0.8;
                    }
                  }
                  const genRatio = finalGen / plan.monthlyGenKwh;
                  const newSavings = Math.round(plan.finance.monthlySavings * genRatio);
                  const annualSavings = newSavings * 12;
                  
                  const chartData = [];
                  let currentNet = -totalPrice;
                  for (let year = 0; year <= 25; year++) {
                    if (year === 0) {
                      chartData.push({ year: 0, netValue: currentNet });
                    } else {
                      currentNet += annualSavings * Math.pow(0.995, year - 1);
                      chartData.push({ year, netValue: Math.round(currentNet) });
                    }
                  }
                  return chartData;
                })()} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="customGradHid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedType === 'ongrid' ? '#10B981' : '#F59E0B'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={selectedType === 'ongrid' ? '#10B981' : '#F59E0B'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a7f3d0" />
                <XAxis dataKey="year" tickFormatter={(v) => `N${v}`} tick={{ fill: '#047857', fontSize: 11 }} axisLine={{ stroke: '#a7f3d0' }} tickLine={false} />
                <YAxis tickFormatter={formatVndM} tick={{ fill: '#047857', fontSize: 10 }} axisLine={{ stroke: '#a7f3d0' }} tickLine={false} width={52} />
                <Legend formatter={() => <span style={{color: '#065f46', fontSize: '12px'}}>{selectedType === 'ongrid' ? 'Hòa Lưới ST-ECO' : 'Hybrid ST-HYBRID'}</span>} />
                <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'Điểm hoàn vốn', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                <Area isAnimationActive={false} type="monotone" dataKey="netValue" name="Giá trị" stroke={selectedType === 'ongrid' ? '#10B981' : '#F59E0B'} strokeWidth={2.5} fill="url(#customGradHid)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
