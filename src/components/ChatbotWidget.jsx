// src/components/ChatbotWidget.jsx
// AI Chatbot powered by Google Gemini API with local knowledge fallback
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Sun, Zap, Shield, FileText,
  HelpCircle, Building2, ChevronDown, Phone, RotateCcw,
  Sparkles, WifiOff,
} from 'lucide-react';
import { CHATBOT_KNOWLEDGE_BASE, DEFAULT_BOT_GREETING } from '../data/chatbotKnowledge';
import { SYSTEM_COMBOS, STANDARD_ACCESSORIES, PROVINCES_PSH } from '../data/solarData';

// ── Gemini config ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-flash-lite-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── System instruction (injected as systemInstruction) ────────────────────────
const SYSTEM_INSTRUCTION = `Bạn là Trợ lý Kỹ thuật & Tư vấn Giải pháp cao cấp của Công ty Cổ phần XBSolar (xbsolar.vn).

## VAI TRÒ & PHONG CÁCH
- Xưng "Em", gọi khách là "Anh/Chị". Giọng điệu chuyên nghiệp, thân thiện, rõ ràng.
- Trả lời súc tích, tối đa 250 từ mỗi lượt. Ưu tiên dùng danh sách gạch đầu dòng để dễ đọc.
- Luôn chào hỏi lịch sự ở lượt đầu tiên.
- Cuối mỗi câu trả lời kỹ thuật quan trọng, khéo léo mời khách để lại số điện thoại/Zalo hoặc gọi Hotline 08.9811.0068 để kỹ sư khảo sát và báo giá miễn phí tại nhà.

## KIẾN THỨC SẢN PHẨM XB-ECO (HÒA LƯỚI ON-GRID)
- **XB-ECO 3kW**: Inverter Sungrow SG3.0RS (1 pha), 5 tấm JA Solar JAM66D45 LB 610W, 3.05 kWp, cần 13m², giá 42 triệu. Phù hợp hóa đơn 1.5–2.5 triệu/tháng.
- **XB-ECO 5kW**: Inverter Sungrow SG5.0RS (1 pha), 9 tấm JA Solar JAM66D45 LB 610W, 5.49 kWp, cần 23m², giá 68 triệu. Phù hợp hóa đơn 2.5–4.5 triệu/tháng.
- **XB-ECO 10kW**: Inverter Sungrow SG10RS/SG10RT (3 pha), 16 tấm JA Solar JAM72D42 LB 630W, 10.08 kWp, cần 42m², giá 125 triệu. Phù hợp hóa đơn 5–9 triệu/tháng.

## KIẾN THỨC SẢN PHẨM XB-HYBRID (LƯU TRỮ BESS)
- **XB-HYBRID 5kW (Áp Thấp)**: Inverter Sungrow MG5RL (1 pha Hybrid) + Pin LiFePO4 Sungrow MGL060 6.0 kWh, 9 tấm JA 610W, 5.49 kWp, 23m², giá 118 triệu.
- **XB-HYBRID 5kW PRO (Lưu trữ lớn)**: Inverter Sungrow MG6RL (1 pha Hybrid) + Pin LiFePO4 Sungrow MBL160 16.0 kWh, 10 tấm JA 610W, 6.10 kWp, 26m², giá 165 triệu.
- **XB-HYBRID 10kW (Biệt thự 3 pha)**: Inverter Sungrow MG10TL/SH10RT (3 pha Hybrid) + Pin Cao Áp SBR096 9.6 kWh, 16 tấm JA 630W, 10.08 kWp, 42m², giá 220 triệu.

## PHỤ KIỆN TIÊU CHUẨN (đã bao gồm trong giá)
- Tủ điện AC/DC Solar Mersen (chống sét lan truyền Type II DC/AC, cầu chì bảo vệ quá dòng)
- Rapid Shutdown Sungrow SR20D-M (ngắt khẩn cấp an toàn PCCC, hạ áp <30V trong 30 giây)
- Hệ khung ray nhôm Antai/Hopergy (chống ăn mòn muối biển)
- Cáp điện DC Leader/KBE 4.0mm², phụ kiện kẹp tiếp địa chuẩn IEC

## BỨC XẠ MẶT TRỜI (PSH) THEO VÙNG
TP.HCM & Bình Dương: 4.6h/ngày | Tiền Giang, Long An: 4.7h/ngày | Tây Ninh: 4.8h/ngày | Đồng Nai: 4.5h/ngày

## KIẾN THỨC KỸ THUẬT QUAN TRỌNG
- **Hòa lưới vs Hybrid**: Hòa lưới tiết kiệm chi phí đầu tư, hoàn vốn nhanh (4–6 năm), KHÔNG có điện dự phòng khi cúp điện. Hybrid có pin lưu trữ, chuyển mạch <20ms khi cúp điện, hoàn vốn 6–9 năm.
- **An toàn PCCC**: Pin LiFePO4 là loại an toàn nhất, không cháy nổ khi quá nhiệt/va đập. Rapid Shutdown bắt buộc cho mọi công trình.
- **Mái nhà**: Tôn dùng kẹp Seamlock/Kliplok (không khoan); Ngói dùng móc inox 304; Bê tông dùng khung Unistrut nghiêng 10–15°. Cam kết 100% không dột.
- **Bảo hành**: JA Solar 12 năm vật lý / 25–30 năm hiệu suất; Inverter Sungrow 5 năm; Pin BESS 10 năm / 6.000 chu kỳ; EPC 2 năm.
- **Thủ tục EVN**: Hệ thống <100kWp hộ gia đình được khuyến khích, XBSolar hỗ trợ trọn gói hồ sơ và tích hợp Zero Export.

## VỀ XBSOLAR
- Top 4 Nhà phân phối chính thức Sungrow tại Việt Nam, đã cung cấp >37 MW biến tần.
- Dự án tiêu biểu: KCN Phước Đông 3.4MW, Sheico 8MW, Worldon 15MW.
- VP Giao dịch: 38 Song Hành, Lake View City, Q.8, TP.HCM.
- Tổng kho: 01 Gò Nổi, P. Long Trường, Q.9, TP.HCM.
- Hotline/Zalo kỹ thuật 24/7: **08.9811.0068**.

## QUY TẮC TƯ VẤN
1. Nếu khách hỏi về giá/báo giá → Ước tính sơ bộ theo hóa đơn điện, sau đó mời khảo sát miễn phí.
2. Nếu khách hỏi ngoài lĩnh vực điện mặt trời → Lịch sự từ chối và hướng về chủ đề chuyên môn.
3. Không đưa ra con số tuyệt đối về tiết kiệm mà không biết tiêu thụ thực tế của khách.
4. Luôn nhắc đến chính sách bảo hành và dịch vụ hậu mãi như một điểm mạnh cạnh tranh.`;

// ── Local fallback helpers ─────────────────────────────────────────────────────

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function findAnswer(query) {
  if (!query.trim()) return null;
  const q = normalize(query);
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of CHATBOT_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(normalize(kw))) score += 2;
      const words = normalize(kw).split(' ');
      for (const w of words) {
        if (w.length > 2 && q.includes(w)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestScore >= 1 ? bestMatch : null;
}

// ── Gemini API call ───────────────────────────────────────────────────────────

/**
 * Calls Gemini API with full conversation history.
 * @param {Array<{role: string, parts: Array}>} history - Gemini-format history
 * @returns {Promise<string>} - Bot reply text
 */
async function callGeminiAPI(history) {
  if (!GEMINI_API_KEY) throw new Error('No API key configured');

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: history,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 512,
        candidateCount: 1,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text.trim();
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function BotAnswer({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <p key={i} className={line.trim() === '' ? 'h-1' : 'leading-relaxed'}>
          {renderMarkdown(line)}
        </p>
      ))}
    </div>
  );
}

// ── Category icon map ─────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  KyThuat:   { icon: Zap,       color: 'text-amber-400',  bg: 'bg-amber-500/20'  },
  AnToan:    { icon: Shield,    color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  LapDat:    { icon: Sun,       color: 'text-blue-400',   bg: 'bg-blue-500/20'   },
  ChinhSach: { icon: FileText,  color: 'text-purple-400', bg: 'bg-purple-500/20' },
  PhapLy:    { icon: Building2, color: 'text-rose-400',   bg: 'bg-rose-500/20'   },
  ThuongHieu:{ icon: HelpCircle,color: 'text-cyan-400',   bg: 'bg-cyan-500/20'   },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end flex-row-reverse'} animate-fade-in`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'bg-slate-700/90 border border-slate-600/50 text-slate-200 rounded-tl-sm'
            : 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-tr-sm'
        }`}
      >
        {isBot ? <BotAnswer text={msg.text} /> : <p>{msg.text}</p>}

        {/* Source badge */}
        {isBot && msg.source && (
          <div className="mt-2 flex items-center gap-1">
            {msg.source === 'gemini' ? (
              <span className="inline-flex items-center gap-1 text-[9px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                <Sparkles className="w-2.5 h-2.5" /> Gemini AI
              </span>
            ) : msg.source === 'fallback' ? (
              <span className="inline-flex items-center gap-1 text-[9px] text-blue-400/70 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                <WifiOff className="w-2.5 h-2.5" /> Offline KB
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickChip({ entry, onClick }) {
  const cat = CATEGORY_ICONS[entry.category] || CATEGORY_ICONS.KyThuat;
  const Icon = cat.icon;
  return (
    <button
      onClick={() => onClick(entry)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        border border-white/10 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300
        hover:text-white transition-all duration-150 hover:scale-105 active:scale-95
        whitespace-nowrap flex-shrink-0"
    >
      <Icon className={`w-3 h-3 ${cat.color}`} />
      {entry.question.split(' ').slice(0, 5).join(' ')}…
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
        <Sparkles className="w-3.5 h-3.5 text-slate-900" />
      </div>
      <div className="bg-slate-700/90 border border-slate-600/50 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <span className="text-slate-400 text-[10px] font-medium">Đang suy nghĩ...</span>
        </div>
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: 'bot', text: DEFAULT_BOT_GREETING, source: null },
  ]);
  // Gemini-format conversation history (excluding system instruction)
  const [geminiHistory, setGeminiHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'ok' | 'fallback' | 'unknown'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen, scrollToBottom]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) setHasNewMsg(true);
  }, [messages, isOpen]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const openChat = () => { setIsOpen(true); setHasNewMsg(false); };

  // ── Core message send logic ─────────────────────────────────────────────────
  const addUserMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userText = text.trim();
    const userId = Date.now();

    // 1. Append user bubble
    setMessages((prev) => [...prev, { id: userId, role: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);

    // 2. Build new Gemini history entry
    const newUserEntry = { role: 'user', parts: [{ text: userText }] };
    const updatedHistory = [...geminiHistory, newUserEntry];

    let botText = '';
    let source = 'gemini';

    try {
      // 3a. Try Gemini API
      botText = await callGeminiAPI(updatedHistory);
      setApiStatus('ok');

      // Append model reply to history for next turn
      setGeminiHistory([
        ...updatedHistory,
        { role: 'model', parts: [{ text: botText }] },
      ]);
    } catch (err) {
      console.warn('[XBSolar Chatbot] Gemini API error, falling back:', err.message);
      setApiStatus('fallback');
      source = 'fallback';

      // 3b. Local fallback
      const match = findAnswer(userText);
      botText = match
        ? match.answer
        : `Em chưa có thông tin chi tiết về vấn đề này.\nAnh/chị vui lòng liên hệ trực tiếp:\n📞 Hotline/Zalo: **08.9811.0068** — kỹ sư XBSolar sẽ hỗ trợ ngay!`;

      // Don't push to Gemini history on fallback to keep it clean
      setGeminiHistory(updatedHistory);
    }

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: 'bot', text: botText, source },
    ]);
  }, [isTyping, geminiHistory]);

  const handleSend = (e) => {
    e?.preventDefault();
    addUserMessage(inputValue);
  };

  const handleChipClick = (entry) => {
    addUserMessage(entry.question);
  };

  const handleReset = () => {
    setMessages([{ id: 0, role: 'bot', text: DEFAULT_BOT_GREETING, source: null }]);
    setGeminiHistory([]);
    setInputValue('');
    setApiStatus('unknown');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── API status indicator ────────────────────────────────────────────────────
  const StatusDot = () => {
    if (apiStatus === 'ok') return (
      <span className="flex items-center gap-1 text-[9px] text-emerald-400">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        Gemini AI
      </span>
    );
    if (apiStatus === 'fallback') return (
      <span className="flex items-center gap-1 text-[9px] text-blue-400">
        <WifiOff className="w-2.5 h-2.5" /> Offline mode
      </span>
    );
    return (
      <span className="text-emerald-400 text-[10px] font-medium">● Đang trực tuyến</span>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating toggle button ─────────────────────────────────────────── */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300
          ${isOpen
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 hover:scale-110 animate-pulse-gold'
          }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat hỗ trợ AI'}
        id="chatbot-toggle-btn"
      >
        {isOpen
          ? <X className="w-6 h-6 text-slate-200" />
          : <MessageCircle className="w-6 h-6 text-slate-900" />
        }
        {!isOpen && hasNewMsg && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
        )}
      </button>

      {/* ── Chat window ───────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96
          flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{ maxHeight: 'min(600px, calc(100vh - 10rem))' }}
        role="dialog"
        aria-label="Chatbot AI hỗ trợ XBSolar"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/40">
                <Sparkles className="w-[18px] h-[18px] text-slate-900" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">XBSolar AI Assistant</p>
              <StatusDot />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="tel:0898110068"
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
              title="Gọi hotline"
              id="chatbot-call-btn"
            >
              <Phone className="w-3 h-3" />
              Gọi ngay
            </a>
            <button
              onClick={handleReset}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
              title="Bắt đầu lại"
              id="chatbot-reset-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
              aria-label="Đóng chat"
              id="chatbot-close-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-slate-900/95 px-4 py-4 space-y-3 scroll-smooth"
          style={{ minHeight: 0 }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-28 right-4 w-8 h-8 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors animate-fade-in z-10"
            aria-label="Cuộn xuống"
          >
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* Quick FAQ chips */}
        <div className="bg-slate-900/95 border-t border-white/5 px-3 py-2.5 flex-shrink-0">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide mb-2 px-1">
            Câu hỏi thường gặp
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CHATBOT_KNOWLEDGE_BASE.map((entry) => (
              <QuickChip key={entry.id} entry={entry} onClick={handleChipClick} />
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="bg-slate-800/95 border-t border-white/10 px-3 py-3 flex-shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về điện mặt trời..."
              className="flex-1 bg-slate-700/60 border border-slate-600 focus:border-amber-500
                focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-white
                placeholder-slate-500 outline-none transition-all duration-200 disabled:opacity-50"
              id="chatbot-input"
              aria-label="Nhập câu hỏi"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-md shadow-amber-500/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-700 cursor-not-allowed opacity-50'
                }`}
              id="chatbot-send-btn"
              aria-label="Gửi"
            >
              <Send className={`w-4 h-4 ${inputValue.trim() && !isTyping ? 'text-slate-900' : 'text-slate-500'}`} />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-slate-600 text-[10px]">
              Powered by{' '}
              <span className="text-amber-500/80 font-semibold">Gemini AI</span>
            </span>
            <a
              href="https://zalo.me/0898110068"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400/70 hover:text-blue-400 text-[10px] font-medium transition-colors"
              id="chatbot-zalo-link"
            >
              Zalo tư vấn →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
