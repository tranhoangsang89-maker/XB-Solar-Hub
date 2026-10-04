import React from 'react';
import { Award, Zap, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function BrandTrust() {
  const stats = [
    {
      value: 'TOP 4',
      label: 'Đại lý phân phối Sungrow',
      sub: 'Chính thức tại Việt Nam',
      icon: Award
    },
    {
      value: '37+ MW',
      label: 'Tổng công suất biến tần',
      sub: 'Sungrow đã cung ứng',
      icon: Zap
    },
    {
      value: '3+ MW',
      label: 'Tổng thầu thi công EPC',
      sub: 'Dự án công nghiệp & dân dụng',
      icon: ShieldCheck
    },
    {
      value: '24H',
      label: 'Giao hàng hỏa tốc',
      sub: 'Tổng kho Long Trường, TP.HCM',
      icon: Clock
    }
  ];

  const partners = [
    { name: 'SUNGROW', desc: 'Inverter #1 Thế giới' },
    { name: 'JA SOLAR', desc: 'Tier-1 TOPCon N-Type' },
    { name: 'JINKO SOLAR', desc: 'Tấm pin Tiger Neo' },
    { name: 'MERSEN', desc: 'Tủ điện & Chống sét PCCC' },
    { name: 'ANTAI SOLAR', desc: 'Khung ray nhôm cao cấp' }
  ];

  return (
    <section className="relative py-16 px-4 max-w-6xl mx-auto">
      {/* Hiệu ứng hào quang ngầm phía sau */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header nhỏ gọn, tinh tế */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-emerald-200 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" /> Đối tác chiến lược cấp 1
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-teal-800 tracking-tight">
          Hồ Sơ Năng Lực & Uy Tín <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">SMARTTECH</span>
        </h3>
        <p className="text-emerald-700 text-sm mt-2 max-w-xl mx-auto">
          Đảm bảo 100% thiết bị chính hãng, kho hàng sẵn có tại TP.HCM và dịch vụ kỹ thuật tiêu chuẩn tổng thầu EPC.
        </p>
      </div>

      {/* 4 Thẻ Bento Grid đồng điệu sang trọng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx}
              className="group relative p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:border-amber-500/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-white/80 border border-emerald-200/60 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-800 tracking-tight mb-1 group-hover:text-amber-300 transition-colors">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-slate-200">{s.label}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Dải thương hiệu phong cách Minimalist Badge */}
      <div className="p-4 rounded-2xl bg-teal-900/60 border border-emerald-200/80 flex flex-wrap items-center justify-around gap-6 text-center">
        {partners.map((p, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-wider text-emerald-800 hover:text-amber-400 transition-colors">
              {p.name}
            </span>
            <span className="text-[10px] text-emerald-700 tracking-tight">{p.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
