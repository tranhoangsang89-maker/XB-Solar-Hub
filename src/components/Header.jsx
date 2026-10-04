// src/components/Header.jsx
import { Sun, Phone, MessageCircle, Zap, MapPin } from 'lucide-react';

export default function Header({ onConsult }) {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism backdrop */}
      <div className="bg-emerald-50/95 backdrop-blur-md border-b border-emerald-200 shadow-lg shadow-black/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <a href="/" className="relative block">
                <img 
                  src="/logo-smarttech-nbg.png" 
                  alt="Smart Tech Hub Logo" 
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </a>
              <div>
                <div className="flex items-center">
                  <span className="text-lg font-black text-blue-600 tracking-tight leading-none">SMART</span>
                  <span className="text-lg font-black text-green-500 tracking-tight leading-none">TECH</span>
                </div>
                <p className="text-[10px] text-amber-500 font-medium hidden sm:block">Giải pháp điện mặt trời cho mọi nhà</p>
              </div>
            </div>

            {/* Address (Hidden on mobile/tablet) */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center px-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border border-emerald-300">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Trụ sở chính</span>
                <span className="text-xs font-medium text-teal-900">Số 1 Nổi, P. Long Trường, TP. HCM, VN</span>
              </div>
            </div>

            {/* Right side: Hotline + Zalo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hotline */}
              <a
                href="tel:0984807679"
                className="hidden sm:flex items-center gap-2 bg-white hover:bg-emerald-100 border border-emerald-300 hover:border-amber-500/50 rounded-xl px-3 py-2 transition-all duration-200 group"
                aria-label="Gọi hotline Smart Tech"
              >
                <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[9px] text-emerald-700 leading-none mb-0.5">Hotline tư vấn</p>
                  <p className="text-sm font-bold text-teal-800 leading-none">0984 807 679</p>
                </div>
              </a>

              {/* Zalo button */}
              <a
                href="https://zalo.me/0984807679"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 group"
                aria-label="Liên hệ qua Zalo"
              >
                <MessageCircle className="w-4 h-4 text-teal-800" />
                <span className="text-teal-800 text-sm font-semibold hidden sm:inline">Zalo</span>
              </a>

              {/* CTA Button */}
              <button
                onClick={onConsult}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-teal-800 font-bold text-sm rounded-xl px-4 py-2.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/40 active:scale-95"
                id="header-consult-btn"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden xs:inline">Tư vấn</span>
                <span className="inline xs:hidden">TV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
