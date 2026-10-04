// src/components/ChatbotWidget.jsx
// AI Chatbot powered by Google Gemini API with vision (image upload) support
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MessageCircle, X, Send, Sun, Zap, Shield, FileText,
  HelpCircle, Building2, ChevronDown, Phone, RotateCcw,
  Sparkles, WifiOff, ImagePlus, XCircle,
} from 'lucide-react';
import { CHATBOT_KNOWLEDGE_BASE, DEFAULT_BOT_GREETING } from '../data/chatbotKnowledge';
import { SYSTEM_COMBOS, STANDARD_ACCESSORIES, PROVINCES_PSH } from '../data/solarData';

// ── Gemini config ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-flash-lite-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── System instruction ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `Bạn là Trợ lý Kỹ thuật & Tư vấn Giải pháp cao cấp của Công ty TNHH Thương mại và Kỹ thuật SMARTTECH (smarttech.vn).

## VAI TRÒ & PHONG CÁCH
- Xưng "Em", gọi khách là "Anh/Chị". Giọng điệu chuyên nghiệp, thân thiện, rõ ràng.
- Trả lời súc tích, tối đa 250 từ mỗi lượt. Ưu tiên dùng danh sách gạch đầu dòng để dễ đọc.
- Luôn chào hỏi lịch sự ở lượt đầu tiên.
- Cuối mỗi câu trả lời kỹ thuật quan trọng, khéo léo mời khách để lại số điện thoại/Zalo hoặc gọi Hotline 0984 807 679 để kỹ sư khảo sát và báo giá miễn phí tại nhà.

## KHI NHẬN ĐƯỢC ẢNH TỪ KHÁCH
- Nếu là **hóa đơn tiền điện**: Đọc số kWh tiêu thụ, số tiền, chu kỳ. Từ đó ước tính hệ thống phù hợp (công suất kWp, số tấm pin, giá sơ bộ, ROI).
- Nếu là **mặt bằng / mái nhà**: Phân tích hướng mái, diện tích ước tính, loại mái (tôn/ngói/bê tông). Đề xuất số lượng tấm pin, cách bố trí, lưu ý kỹ thuật.
- Nếu là **ảnh công trình hoặc thiết bị**: Nhận diện thiết bị, đánh giá tình trạng, đưa ra khuyến nghị.
- Luôn nói rõ đây là **phân tích sơ bộ qua ảnh**, cần khảo sát thực tế để chính xác hơn.

## KIẾN THỨC SẢN PHẨM ST-ECO (HÒA LƯỚI ON-GRID)
- **ST-ECO 3kW**: Inverter Sungrow SG3.0RS (1 pha), 5 tấm JA Solar JAM66D45 LB 610W, 3.05 kWp, cần 13m², giá 42 triệu. Phù hợp hóa đơn 1.5–2.5 triệu/tháng.
- **ST-ECO 5kW**: Inverter Sungrow SG5.0RS (1 pha), 9 tấm JA Solar JAM66D45 LB 610W, 5.49 kWp, cần 23m², giá 68 triệu. Phù hợp hóa đơn 2.5–4.5 triệu/tháng.
- **ST-ECO 10kW**: Inverter Sungrow SG10RS/SG10RT (3 pha), 16 tấm JA Solar JAM72D42 LB 630W, 10.08 kWp, cần 42m², giá 125 triệu. Phù hợp hóa đơn 5–9 triệu/tháng.

## KIẾN THỨC SẢN PHẨM ST-HYBRID (LƯU TRỮ BESS)
- **ST-HYBRID 5kW (Áp Thấp)**: Inverter Sungrow MG5RL (1 pha Hybrid) + Pin LiFePO4 Sungrow MGL060 6.0 kWh, 9 tấm JA 610W, 5.49 kWp, 23m², giá 118 triệu.
- **ST-HYBRID 5kW PRO (Lưu trữ lớn)**: Inverter Sungrow MG6RL (1 pha Hybrid) + Pin LiFePO4 Sungrow MBL160 16.0 kWh, 10 tấm JA 610W, 6.10 kWp, 26m², giá 165 triệu.
- **ST-HYBRID 10kW (Biệt thự 3 pha)**: Inverter Sungrow MG10TL/SH10RT (3 pha Hybrid) + Pin Cao Áp SBR096 9.6 kWh, 16 tấm JA 630W, 10.08 kWp, 42m², giá 220 triệu.

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
- **Thủ tục EVN**: Hệ thống <100kWp hộ gia đình được khuyến khích, SmartTech hỗ trợ trọn gói hồ sơ và tích hợp Zero Export.

## VỀ SMARTTECH
- Top 4 Nhà phân phối chính thức Sungrow tại Việt Nam, đã cung cấp >37 MW biến tần.
- Dự án tiêu biểu: KCN Phước Đông 3.4MW, Sheico 8MW, Worldon 15MW.
- VP Giao dịch: Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh.
- Tổng kho: 01 Gò Nổi, P. Long Trường, Q.9, TP.HCM.
- Hotline/Zalo kỹ thuật 24/7: **0984 807 679**.

## QUY TẮC TƯ VẤN
1. Nếu khách hỏi về giá/báo giá → Ước tính sơ bộ theo hóa đơn điện, sau đó mời khảo sát miễn phí.
2. Nếu khách hỏi ngoài lĩnh vực điện mặt trời → Lịch sự từ chối và hướng về chủ đề chuyên môn.
3. Không đưa ra con số tuyệt đối về tiết kiệm mà không biết tiêu thụ thực tế của khách.
4. Luôn nhắc đến chính sách bảo hành và dịch vụ hậu mãi như một điểm mạnh cạnh tranh.`;

// ── Image helper: File → base64 data URL ─────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/jpeg;base64,....
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Strip the "data:image/xxx;base64," prefix → raw base64 string
function extractBase64(dataUrl) {
  return dataUrl.split(',')[1];
}

function getMimeType(dataUrl) {
  return dataUrl.match(/data:(image\/[^;]+);/)?.[1] || 'image/jpeg';
}

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

// ── Gemini API call (supports vision) ─────────────────────────────────────────

/**
 * Calls Gemini API with full conversation history (may include image parts).
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
        maxOutputTokens: 600,
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
  KyThuat:    { icon: Zap,        color: 'text-amber-400',  bg: 'bg-amber-500/20'  },
  AnToan:     { icon: Shield,     color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  LapDat:     { icon: Sun,        color: 'text-blue-400',   bg: 'bg-blue-500/20'   },
  ChinhSach:  { icon: FileText,   color: 'text-purple-400', bg: 'bg-purple-500/20' },
  PhapLy:     { icon: Building2,  color: 'text-rose-400',   bg: 'bg-rose-500/20'   },
  ThuongHieu: { icon: HelpCircle, color: 'text-cyan-400',   bg: 'bg-cyan-500/20'   },
};

// ── MessageBubble (with image preview support) ────────────────────────────────

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end flex-row-reverse'} animate-fade-in`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-teal-800" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'bg-emerald-100/90 border border-emerald-300/50 text-slate-200 rounded-tl-sm'
            : 'bg-gradient-to-br from-amber-500 to-amber-600 text-teal-800 font-semibold rounded-tr-sm'
        }`}
      >
        {/* Image previews (user side) */}
        {msg.images && msg.images.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 mb-2 ${isBot ? '' : '-mx-1'}`}>
            {msg.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Ảnh ${i + 1}`}
                className="h-24 w-auto max-w-[140px] object-cover rounded-lg border border-white/20 shadow"
              />
            ))}
          </div>
        )}

        {isBot ? <BotAnswer text={msg.text} /> : msg.text ? <p>{msg.text}</p> : null}

        {/* Source badge */}
        {isBot && msg.source && (
          <div className="mt-2 flex items-center gap-1">
            {msg.source === 'gemini' ? (
              <span className="inline-flex items-center gap-1 text-[9px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-2.5 h-2.5" /> Gemini AI
              </span>
            ) : msg.source === 'vision' ? (
              <span className="inline-flex items-center gap-1 text-[9px] text-purple-400/70 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                <ImagePlus className="w-2.5 h-2.5" /> Vision AI
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
        border border-emerald-200/50 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-800
        hover:text-teal-800 transition-all duration-150 hover:scale-105 active:scale-95
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
        <Sparkles className="w-3.5 h-3.5 text-teal-800" />
      </div>
      <div className="bg-emerald-100/90 border border-emerald-300/50 rounded-2xl rounded-tl-sm px-4 py-3">
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
          <span className="text-emerald-700 text-[10px] font-medium">Đang phân tích...</span>
        </div>
      </div>
    </div>
  );
}

// ── Image preview strip (above input) ────────────────────────────────────────

function ImagePreviewStrip({ previews, onRemove }) {
  if (!previews.length) return null;
  return (
    <div className="px-3 pt-2 flex gap-2 flex-wrap">
      {previews.map((src, i) => (
        <div key={i} className="relative group">
          <img
            src={src}
            alt={`Preview ${i + 1}`}
            className="h-16 w-auto max-w-[100px] object-cover rounded-lg border border-amber-500/40 shadow"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Xóa ảnh"
          >
            <X className="w-3 h-3 text-teal-800" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([
    { id: 0, role: 'bot', text: DEFAULT_BOT_GREETING, source: null },
  ]);
  const [geminiHistory, setGeminiHistory] = useState([]);
  const [inputValue, setInputValue]   = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [hasNewMsg, setHasNewMsg]     = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [apiStatus, setApiStatus]     = useState('unknown');
  const [vpHeight, setVpHeight]       = useState(() => window.innerHeight);

  // Image upload state
  const [pendingImages, setPendingImages] = useState([]); // [{ dataUrl, file }]

  const messagesEndRef      = useRef(null);
  const inputRef            = useRef(null);
  const scrollContainerRef  = useRef(null);
  const fileInputRef        = useRef(null);

  // Track visual viewport for keyboard-aware layout on mobile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setVpHeight(vv.height);
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // Detect mobile (< 640px)
  const isMobile = useMemo(() => window.innerWidth < 640, []);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen, scrollToBottom]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) setHasNewMsg(true);
  }, [messages, isOpen]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const openChat = () => { setIsOpen(true); setHasNewMsg(false); };

  // ── Image picker handler ──────────────────────────────────────────────────
  const handleImagePick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = await Promise.all(
      files.slice(0, 4).map(async (file) => {
        const dataUrl = await fileToBase64(file);
        return { dataUrl, file };
      })
    );
    setPendingImages((prev) => [...prev, ...newImages].slice(0, 4)); // max 4
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Core message send logic ───────────────────────────────────────────────
  const addUserMessage = useCallback(async (text, images = []) => {
    const hasText   = text.trim().length > 0;
    const hasImages = images.length > 0;
    if ((!hasText && !hasImages) || isTyping) return;

    const userText = text.trim();
    const userId   = Date.now();

    // 1. Append user bubble (with image previews)
    setMessages((prev) => [
      ...prev,
      {
        id:     userId,
        role:   'user',
        text:   userText,
        images: images.map((img) => img.dataUrl),
      },
    ]);
    setInputValue('');
    setPendingImages([]);
    setIsTyping(true);

    // 2. Build Gemini parts for this user turn
    const parts = [];
    if (userText) parts.push({ text: userText });
    for (const img of images) {
      parts.push({
        inline_data: {
          mime_type: getMimeType(img.dataUrl),
          data:      extractBase64(img.dataUrl),
        },
      });
    }
    // Add image context hint if no text
    if (!userText && hasImages) {
      parts.unshift({
        text: 'Anh/chị gửi lên ảnh này, em hãy phân tích và tư vấn giải pháp điện mặt trời phù hợp.',
      });
    }

    const newUserEntry    = { role: 'user', parts };
    const updatedHistory  = [...geminiHistory, newUserEntry];

    let botText = '';
    let source  = hasImages ? 'vision' : 'gemini';

    try {
      botText = await callGeminiAPI(updatedHistory);
      setApiStatus('ok');
      setGeminiHistory([
        ...updatedHistory,
        { role: 'model', parts: [{ text: botText }] },
      ]);
    } catch (err) {
      console.warn('[SmartTech Chatbot] Gemini API error, falling back:', err.message);
      setApiStatus('fallback');
      source = 'fallback';

      if (hasImages) {
        botText = `Em chưa thể phân tích ảnh do kết nối gián đoạn.\nAnh/chị vui lòng gọi trực tiếp:\n📞 Hotline/Zalo: **0984 807 679** — kỹ sư SmartTech sẽ hỗ trợ ngay!`;
      } else {
        const match = findAnswer(userText);
        botText = match
          ? match.answer
          : `Em chưa có thông tin chi tiết về vấn đề này.\nAnh/chị vui lòng liên hệ trực tiếp:\n📞 Hotline/Zalo: **0984 807 679** — kỹ sư SmartTech sẽ hỗ trợ ngay!`;
      }
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
    addUserMessage(inputValue, pendingImages);
  };

  const handleChipClick = (entry) => {
    addUserMessage(entry.question);
  };

  const handleReset = () => {
    setMessages([{ id: 0, role: 'bot', text: DEFAULT_BOT_GREETING, source: null }]);
    setGeminiHistory([]);
    setInputValue('');
    setPendingImages([]);
    setApiStatus('unknown');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── API status indicator ──────────────────────────────────────────────────
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

  const canSend = (inputValue.trim() || pendingImages.length > 0) && !isTyping;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating toggle button — hidden on mobile when open ──────────────── */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300
          ${isOpen && isMobile ? 'hidden' : ''}
          ${isOpen && !isMobile
            ? 'bg-emerald-100 hover:bg-emerald-200'
            : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 hover:scale-110 animate-pulse-gold'
          }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat hỗ trợ AI'}
        id="chatbot-toggle-btn"
      >
        {isOpen
          ? <X className="w-6 h-6 text-slate-200" />
          : <MessageCircle className="w-6 h-6 text-teal-800" />
        }
        {!isOpen && hasNewMsg && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
        )}
      </button>

      {/* ── Mobile backdrop ───────────────────────────────────────────────────── */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Chat window ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed z-[60] flex flex-col overflow-hidden
          transition-all duration-500 ease-out
          border border-emerald-200/50 shadow-2xl
          inset-x-0 bottom-0 rounded-t-2xl
          sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:rounded-2xl
          ${isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-full sm:translate-y-0 sm:scale-90 pointer-events-none'
          }`}
        style={{
          height: isMobile ? `${vpHeight}px` : undefined,
          maxHeight: isMobile ? undefined : 'min(600px, calc(100vh - 10rem))',
        }}
        role="dialog"
        aria-label="Chatbot AI hỗ trợ SmartTech"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-emerald-50 border-b border-emerald-200/50 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/40">
                <Sparkles className="w-[18px] h-[18px] text-teal-800" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-200 animate-pulse" />
            </div>
            <div>
              <p className="text-teal-800 font-bold text-sm leading-tight">SmartTech AI Assistant</p>
              <StatusDot />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="tel:0984807679"
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
              title="Gọi hotline"
              id="chatbot-call-btn"
            >
              <Phone className="w-3 h-3" />
              Gọi ngay
            </a>
            <button
              onClick={handleReset}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-teal-800 transition-colors"
              title="Bắt đầu lại"
              id="chatbot-reset-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-teal-800 transition-colors"
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
          className="flex-1 overflow-y-auto bg-emerald-50/95 px-4 py-4 space-y-3 scroll-smooth overscroll-contain"
          style={{ minHeight: 0, WebkitOverflowScrolling: 'touch' }}
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
            className="absolute bottom-28 right-4 w-8 h-8 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-200 transition-colors animate-fade-in z-10"
            aria-label="Cuộn xuống"
          >
            <ChevronDown className="w-4 h-4 text-emerald-800" />
          </button>
        )}

        {/* Quick FAQ chips */}
        <div className="bg-emerald-50/95 border-t border-emerald-200/50 px-3 py-2.5 flex-shrink-0">
          <p className="text-emerald-600 text-[10px] font-semibold uppercase tracking-wide mb-2 px-1">
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

        {/* Image preview strip */}
        <ImagePreviewStrip previews={pendingImages.map((img) => img.dataUrl)} onRemove={removeImage} />

        {/* Input area */}
        <div
          className="bg-white/95 border-t border-emerald-200/50 px-3 py-3 flex-shrink-0"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <form onSubmit={handleSend} className="flex items-center gap-2">

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="chatbot-file-input"
              onChange={handleImagePick}
            />

            {/* Upload image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping || pendingImages.length >= 4}
              title="Tải ảnh lên (hóa đơn, mái nhà...)"
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 relative
                ${pendingImages.length > 0
                  ? 'bg-purple-600/80 border border-purple-400/50 shadow-md shadow-purple-500/20'
                  : 'bg-emerald-100 border border-emerald-300'
                }
                ${(isTyping || pendingImages.length >= 4) ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
              `}
              id="chatbot-image-btn"
              aria-label="Tải ảnh lên"
            >
              <ImagePlus className={`w-5 h-5 ${pendingImages.length > 0 ? 'text-purple-200' : 'text-emerald-700'}`} />
              {pendingImages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-teal-800 text-[9px] font-bold rounded-full flex items-center justify-center border border-emerald-200">
                  {pendingImages.length}
                </span>
              )}
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingImages.length > 0 ? 'Mô tả thêm (tuỳ chọn)...' : 'Hỏi về điện mặt trời...'}
              className="flex-1 bg-emerald-100/60 border border-emerald-300 focus:border-amber-500
                focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-3 text-base sm:text-sm text-teal-800
                placeholder-slate-500 outline-none transition-all duration-200 disabled:opacity-50"
              id="chatbot-input"
              aria-label="Nhập câu hỏi"
              disabled={isTyping}
              inputMode="text"
              autoComplete="off"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!canSend}
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${canSend
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/30 active:scale-95'
                  : 'bg-emerald-100 cursor-not-allowed opacity-50'
                }`}
              id="chatbot-send-btn"
              aria-label="Gửi"
            >
              <Send className={`w-5 h-5 ${canSend ? 'text-teal-800' : 'text-emerald-600'}`} />
            </button>
          </form>

          {/* Upload hint */}
          {pendingImages.length === 0 && (
            <p className="text-emerald-500 text-[10px] mt-2 px-1 flex items-center gap-1">
              <ImagePlus className="w-3 h-3" />
              Gửi ảnh hóa đơn, mặt bằng, kết cấu mái để được tư vấn chính xác hơn
            </p>
          )}

          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className="text-emerald-500 text-[10px]">
              Powered by{' '}
              <span className="text-amber-500/80 font-semibold">Gemini AI</span>
            </span>
            <a
              href="https://zalo.me/0984807679"
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
