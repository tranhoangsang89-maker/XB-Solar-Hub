// src/components/Footer.jsx
import { MapPin, Phone, Mail, Sun, Shield, Award, Clock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-teal-900 to-emerald-900 border-t-4 border-amber-500 mt-16 shadow-2xl">
      {/* Top section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand & Company Info */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <a href="/" className="relative block">
                <img 
                  src="/logo-smarttech-nbg.png" 
                  alt="Smart Tech Hub Logo" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </a>
              <div>
                <span className="text-xl font-black text-amber-400">SMART</span>
                <span className="text-xl font-black text-white ml-1">TECH</span>
              </div>
            </div>
            
            <h2 className="text-white font-bold text-sm sm:text-base mb-3 leading-snug">
              CÔNG TY TNHH THƯƠNG MẠI VÀ KỸ THUẬT SMARTTECH
            </h2>
            
            <div className="space-y-2 text-sm text-emerald-100 mb-6">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 min-w-[90px]">Mã số thuế:</span> 
                <span className="font-semibold text-white">3702675986</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 min-w-[90px]">Đại diện:</span> 
                <span>Mr. Thế Anh (Giám đốc: Nguyễn Thế Anh)</span>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Bảo hành 10-25 năm</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Đối tác Sungrow</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold">Thi công 1–3 ngày</span>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="md:col-span-6 lg:col-span-3">
            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              Liên hệ
            </h3>
            
            <div className="space-y-4 mb-8">
              <a href="tel:0984807679" className="flex items-center gap-3 text-emerald-100 hover:text-amber-400 transition-colors group">
                <div className="w-8 h-8 bg-white group-hover:bg-amber-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400">Hotline / Zalo</p>
                  <p className="font-bold text-white group-hover:text-amber-400 transition-colors">0984 807 679</p>
                </div>
              </a>
              
              <div className="flex items-center gap-3 text-emerald-100">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400">Email</p>
                  <p className="text-sm text-emerald-100">info@smarttech.vn</p>
                </div>
              </div>
            </div>

            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Trụ sở chính
            </h3>
            <div className="bg-white/60 border border-emerald-200 rounded-xl p-3.5">
              <p className="text-sm text-emerald-100 leading-relaxed">
                Số 1 Nổi, Phường Long Trường<br />TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>
          </div>

          {/* Maps */}
          <div className="md:col-span-6 lg:col-span-4">
            <h3 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Bản đồ chỉ đường
            </h3>
            <div className="w-full h-[220px] rounded-xl overflow-hidden border border-emerald-200 shadow-inner">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.528271018698!2d106.8242407!3d10.8473636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e00000001%3A0x1b2826649f8b2c45!2sPh%C6%B0%E1%BB%9Dng%20Long%20Tr%C6%B0%E1%BB%9Dng%2C%20Qu%E1%BA%ADn%209%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Smart Tech"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-emerald-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-emerald-400 text-xs">
            © {currentYear} Smart Tech Hub. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-emerald-500 text-xs">
            Powered by Sang Citizen 0984 807 679
          </p>
        </div>
      </div>
    </footer>
  );
}
