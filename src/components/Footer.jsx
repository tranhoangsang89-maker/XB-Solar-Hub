// src/components/Footer.jsx
import { MapPin, Phone, Mail, Sun, Shield, Award, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-16">
      {/* Top section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <a href="/" className="relative block">
                <img 
                  src="/logo-smarttech-nbg.png" 
                  alt="XB Solar Hub Logo" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </a>
              <div>
                <span className="text-xl font-black text-amber-400">XB</span>
                <span className="text-xl font-black text-white ml-1">SOLAR HUB</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Đơn vị chuyên lắp đặt hệ thống điện mặt trời dân dụng uy tín tại TP.HCM và các tỉnh miền Nam. Đối tác chính thức của Sungrow & JA Solar.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Bảo hành 10-25 năm</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Đối tác Sungrow chính thức</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold">Thi công 1–3 ngày</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              Liên hệ
            </h3>
            <div className="space-y-3">
              <a
                href="tel:0898110068"
                className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors group"
              >
                <div className="w-8 h-8 bg-slate-800 group-hover:bg-amber-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hotline / Zalo</p>
                  <p className="font-bold text-white group-hover:text-amber-400 transition-colors">08.9811.0068</p>
                </div>
              </a>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-300">info@xbsolar.vn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Địa chỉ
            </h3>
            <div className="space-y-4">
              {/* VPGD */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-0.5">VP Giao Dịch</p>
                    <p className="text-sm text-slate-300 leading-snug">Lake View City, Quận 8<br />TP. Hồ Chí Minh</p>
                  </div>
                </div>
              </div>
              {/* Tổng kho */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-0.5">Tổng Kho</p>
                    <p className="text-sm text-slate-300 leading-snug">Long Trường, Quận 9<br />TP. Hồ Chí Minh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-xs">
            © {currentYear} XB Solar Hub. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-slate-600 text-xs">
            Powered by Sang Citizen 0888.003.205
          </p>
        </div>
      </div>
    </footer>
  );
}
