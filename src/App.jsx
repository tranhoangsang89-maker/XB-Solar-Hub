// src/App.jsx
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BillInputStep from './components/CalculatorStep/BillInputStep';
import ResultCompareStep from './components/CalculatorStep/ResultCompareStep';
import RoiChartStep from './components/CalculatorStep/RoiChartStep';
import QuoteModal from './components/QuoteModal';
import ChatbotWidget from './components/ChatbotWidget';
import BrandTrust from './components/BrandTrust';
import ProjectShowcase from './components/ProjectShowcase';
import EpcProcess from './components/EpcProcess';
import SolarDesigner from './components/SolarDesigner';
import { recommendCombos } from './utils/solarCalculator';
import { Sun, Zap, TrendingUp, Shield, Award, ChevronDown, PenTool } from 'lucide-react';

// Step indicator component
function StepIndicator({ currentStep }) {
  const steps = [
    { id: 1, label: 'Nhập thông tin' },
    { id: 2, label: 'So sánh gói' },
    { id: 3, label: 'Phân tích ROI' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep === step.id
                  ? 'step-active'
                  : currentStep > step.id
                  ? 'step-done'
                  : 'step-inactive'
              }`}
            >
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:block transition-colors duration-300 ${
                currentStep === step.id ? 'text-amber-400' : currentStep > step.id ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 transition-all duration-500 ${
                currentStep > step.id ? 'bg-emerald-500' : 'bg-emerald-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Hero section (shown only on step 1)
function HeroSection({ onScrollToCalc }) {
  const features = [
    { icon: Zap, title: 'Tính toán chính xác', desc: 'Dựa trên biểu giá EVN thực tế' },
    { icon: TrendingUp, title: 'So sánh 2 gói', desc: 'Hòa lưới vs Hybrid Sungrow' },
    { icon: Shield, title: 'Bảo hành dài hạn', desc: 'Inverter 10 năm, Pin 25 năm' },
    { icon: Award, title: 'Đối tác chính thức', desc: 'Sungrow & JA Solar Việt Nam' },
  ];

  return (
    <div className="text-center mb-16">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-2 mb-6">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <span className="text-amber-400 text-sm font-semibold">Công cụ tính toán miễn phí</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-teal-800 leading-tight mb-4">
        Điện mặt trời{' '}
        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
          Smart Tech
        </span>
        <br />
        <span className="text-2xl sm:text-3xl lg:text-4xl text-emerald-800 font-bold">
          Tiết kiệm thật — Hoàn vốn nhanh
        </span>
      </h1>

      <p className="text-emerald-700 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
        Nhập hóa đơn điện, chọn tỉnh thành — nhận ngay đề xuất hệ thống phù hợp, phân tích ROI 25 năm và báo giá PDF chuyên nghiệp.
      </p>

      {/* Feature pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card-glass p-4 hover:bg-white/10 transition-all duration-200 hover:scale-105">
            <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-teal-800 text-xs font-bold mb-0.5">{title}</p>
            <p className="text-emerald-600 text-[10px]">{desc}</p>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <button
        onClick={onScrollToCalc}
        className="flex flex-col items-center gap-1 mx-auto text-emerald-600 hover:text-amber-500 transition-colors animate-bounce"
        aria-label="Cuộn xuống để bắt đầu tính toán"
      >
        <span className="text-sm font-semibold">Bắt đầu tính ngay</span>
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  );
}

// Floating solar particles background
function SolarBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Radial gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating sun icon */}
      <div className="absolute top-20 right-10 opacity-5 animate-float">
        <Sun className="w-32 h-32 text-amber-400" />
      </div>
      <div className="absolute bottom-40 left-10 opacity-5 animate-float" style={{ animationDelay: '3s' }}>
        <Sun className="w-20 h-20 text-amber-400" />
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [inputData, setInputData] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedQuoteType, setSelectedQuoteType] = useState('hybrid');
  const [appMode, setAppMode] = useState('quote'); // 'quote' | 'designer'

  const handleStep1Next = ({ monthlyBill, province, usageProfile }) => {
    const result = recommendCombos(monthlyBill, province.psh);
    setInputData({ monthlyBill, province, usageProfile });
    setCalcResult(result);
    setStep(2);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuote = (type = 'hybrid') => {
    setSelectedQuoteType(type);
    setIsQuoteOpen(true);
  };
  const handleCloseQuote = () => setIsQuoteOpen(false);

  const scrollToCalc = () => {
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-emerald-50 relative">
      <SolarBackground />

      {/* Header */}
      <Header onConsult={() => setIsQuoteOpen(true)} />

      {/* Mode Switcher */}
      <div className="relative z-20 flex justify-center mt-6 px-4">
        <div className="bg-white/80 backdrop-blur-md p-1 rounded-full border border-emerald-200 shadow-xl inline-flex overflow-x-auto max-w-full">
          <button
            onClick={() => setAppMode('quote')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
              appMode === 'quote'
                ? 'bg-amber-500 text-teal-800 shadow-lg'
                : 'text-emerald-800 hover:text-teal-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            Báo Giá Nhanh
          </button>
          <button
            onClick={() => setAppMode('designer')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
              appMode === 'designer'
                ? 'bg-emerald-500 text-teal-800 shadow-lg'
                : 'text-emerald-800 hover:text-teal-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            📐 Thiết Kế 2D/3D & Bản Vẽ
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10">
        {appMode === 'quote' ? (
          <>
            {/* Hero (step 1 only) */}
            {step === 1 && (
              <div className="w-full flex flex-col mb-12">
                {/* Full-width Banner Video */}
                <div className="w-full aspect-video md:aspect-[21/9] lg:aspect-[24/9] overflow-hidden shadow-lg mb-10 sm:mb-16 bg-teal-900">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  >
                    <source src="/video-st-logo2.mp4" type="video/mp4" />
                  </video>
                </div>

                <div className="max-w-6xl mx-auto px-4 w-full">
                  <HeroSection onScrollToCalc={scrollToCalc} />
                </div>
              </div>
            )}

        {/* Calculator section */}
        <section
          id="calculator-section"
          className="max-w-6xl mx-auto px-4 pb-20"
          style={{ paddingTop: step === 1 ? 0 : '2.5rem' }}
        >
          {/* Step indicator */}
          <StepIndicator currentStep={step} />

          {/* Steps */}
          {step === 1 && (
            <BillInputStep onNext={handleStep1Next} />
          )}

          {step === 2 && calcResult && (
            <ResultCompareStep
              result={calcResult}
              onNext={handleStep2Next}
              onBack={handleBack}
              onOpenQuote={handleOpenQuote}
            />
          )}

          {step === 3 && calcResult && inputData && (
            <RoiChartStep
              monthlyBill={inputData.monthlyBill}
              province={inputData.province}
              result={calcResult}
              onBack={handleBack}
              onOpenQuote={handleOpenQuote}
            />
          )}
        </section>

            {/* Trust & EPC Process Sections */}
            <BrandTrust />
            <ProjectShowcase />
            <EpcProcess />
          </>
        ) : (
          <section className="max-w-[1400px] mx-auto px-4 py-8">
            <SolarDesigner initialPanelQty={calcResult?.hybrid?.panels || calcResult?.ongrid?.panels || 0} />
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Quote Modal */}
      {calcResult && (
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={handleCloseQuote}
          result={calcResult}
          selectedType={selectedQuoteType}
          monthlyBill={inputData?.monthlyBill || 2000000}
          province={inputData?.province}
        />
      )}

      {/* Chatbot floating widget — renders above everything */}
      <ChatbotWidget />
    </div>
  );
}
