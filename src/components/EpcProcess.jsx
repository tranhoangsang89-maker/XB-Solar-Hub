import { Search, PenTool, Wrench, FileCheck } from 'lucide-react';

export default function EpcProcess() {
  const steps = [
    { icon: Search, title: 'Khảo sát vệ tinh & 3D (24h)', desc: 'Đo đạc diện tích mái hữu dụng, đánh giá góc nghiêng hướng nắng.' },
    { icon: PenTool, title: 'Thiết kế giải pháp & Báo giá tối ưu', desc: 'Chọn combo Sungrow + JA Solar phù hợp thói quen dùng điện.' },
    { icon: Wrench, title: 'Thi công & Đấu nối an toàn PCCC', desc: 'Dùng tủ điện Mersen chống sét lan truyền & bộ ngắt nhanh Rapid Shutdown (2-3 ngày).' },
    { icon: FileCheck, title: 'Bàn giao & Kích hoạt bảo hành', desc: 'Bảo hành thiết bị 5-25 năm từ tổng kho SmartTech, hỗ trợ kỹ thuật trọn đời.' }
  ];

  return (
    <section className="py-16 bg-emerald-50 border-t border-emerald-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-teal-800 mb-2">Quy Trình 4 Bước Chuẩn EPC</h2>
          <p className="text-emerald-700 max-w-2xl mx-auto">Chuyên nghiệp, nhanh chóng và đảm bảo chất lượng hàng đầu</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-emerald-100/50 z-0"></div>
          {steps.map((s, idx) => (
            <div key={idx} className="relative z-10 bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-6 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
                <s.icon className="w-8 h-8" />
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-teal-800 text-xs font-bold flex items-center justify-center absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-lg ring-4 ring-slate-900">
                {idx + 1}
              </div>
              <h3 className="text-teal-800 font-bold mb-3">{s.title}</h3>
              <p className="text-emerald-700 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
