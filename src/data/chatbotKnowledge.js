export const CHATBOT_KNOWLEDGE_BASE = [
  {
    id: 'cup-dien',
    category: 'KyThuat',
    keywords: ['cúp điện', 'mất điện', 'chạy không', 'mất lưới', 'tối có điện không'],
    question: 'Khi cúp điện lưới, hệ thống điện mặt trời có hoạt động được không?',
    answer: `Điều này phụ thuộc vào hệ thống anh/chị lựa chọn:\n1. **Hệ Hòa Lưới (On-Grid - dòng Sungrow SG):** Sẽ TỰ ĐỘNG NGẮT ngay lập tức theo tiêu chuẩn an toàn quốc tế (Anti-Islanding) để bảo vệ nhân viên điện lực khi sửa chữa đường dây.\n2. **Hệ Hybrid có Lưu Trữ (dòng Sungrow MGRL/MGTL + Pin BESS):** Hệ thống sẽ chuyển mạch siêu tốc (<20 mili-giây) sang chế độ dự phòng (EPS/Backup). Các thiết bị như đèn, quạt, tủ lạnh, Wi-Fi, máy lạnh phòng ngủ vẫn hoạt động bình thường và liên tục!`
  },
  {
    id: 'an-toan-chay-no',
    category: 'AnToan',
    keywords: ['cháy nổ', 'an toàn', 'pccc', 'chống sét', 'nổ pin'],
    question: 'Hệ thống và pin lưu trữ có an toàn phòng chống cháy nổ không?',
    answer: `Hệ thống do SmartTech cung cấp đạt tiêu chuẩn an toàn PCCC cao nhất:\n- **Pin lưu trữ Sungrow (MGL060/MBL160/SBR096):** Sử dụng công nghệ pin Lithium sắt photphat (**LiFePO4**), là loại cell pin an toàn nhất thế giới hiện nay, chống cháy nổ ngay cả khi quá nhiệt hay va đập.\n- **Thiết bị ngắt khẩn cấp Rapid Shutdown (Sungrow SR20D-M):** Hạ điện áp trên mái xuống dưới 30V chỉ trong 30 giây khi có sự cố.\n- **Tủ điện chuyên dụng MERSEN:** Tích hợp chống sét lan truyền Type II DC/AC và cầu chì chuyên dụng bảo vệ quá dòng.`
  },
  {
    id: 'mai-nha-phu-hop',
    category: 'LapDat',
    keywords: ['mái tôn', 'mái ngói', 'bê tông', 'thủng mái', 'thấm dột', 'diện tích'],
    question: 'Mái nhà tôn, ngói hay sân thượng bê tông có lắp được không? Có sợ dột không?',
    answer: `Tất cả các loại mái đều lắp đặt rất tốt và **cam kết không dột nước 100%**:\n- **Mái tôn:** Dùng kẹp chuyên dụng Seamlock/Kliplok (không bắn vít xuyên tôn) hoặc pad chân L đệm cao su EPDM chuyên dụng kháng tia UV.\n- **Mái ngói:** Sử dụng móc ngói inox 304 luồn dưới khe ngói, không đục phá kết cấu ngói.\n- **Sân thượng bê tông:** Dựng khung giàn nghiêng hướng Nam 10-15° bằng thép Unistrut mạ kẽm hoặc ray nhôm Antai, tận dụng làm mái che mát sân thượng.`
  },
  {
    id: 'bao-hanh-chinh-hang',
    category: 'ChinhSach',
    keywords: ['bảo hành', 'bao lâu', 'hư hỏng', 'tuổi thọ', 'suy hao'],
    question: 'Thời gian bảo hành thiết bị của SmartTech là bao lâu?',
    answer: `SmartTech là Top 4 Nhà phân phối chính thức của Sungrow tại Việt Nam, cam kết chính sách bảo hành chính hãng cao nhất:\n- **Tấm pin JA Solar N-Type TOPCon:** Bảo hành vật lý **12 năm**, bảo hành hiệu suất tuyến tính **25 - 30 năm** (đảm bảo còn trên 80% công suất).\n- **Inverter Sungrow (Hòa lưới & Hybrid):** Bảo hành chính hãng **5 năm** (hỗ trợ 1 đổi 1 nếu có lỗi sản xuất từ tổng kho SmartTech Long Trường, TP.HCM).\n- **Pin lưu trữ Lithium BESS Sungrow:** Bảo hành **10 năm** hoặc 6.000 chu kỳ sạc/xả.\n- **Dịch vụ EPC:** Bảo hành kỹ thuật lắp đặt và chống dột 2 năm, bảo trì định kỳ miễn phí.`
  },
  {
    id: 'thu-tuc-dien-luc',
    category: 'PhapLy',
    keywords: ['thủ tục', 'điện lực', 'evn', 'bán điện', 'xin phép', 'nghị định'],
    question: 'Lắp điện mặt trời có cần xin phép điện lực EVN không?',
    answer: `Theo chính sách phát triển điện mặt trời mái nhà tự sản - tự tiêu mới nhất:\n- Hệ thống dưới 100kWp lắp cho hộ gia đình được **khuyến khích phát triển**, thủ tục đăng ký rất đơn giản.\n- SmartTech sẽ trang bị sẵn thiết bị **Bám tải thông minh (Zero Export)** để chống phát ngược điện thừa lên lưới ngoài ý muốn.\n- Đội ngũ kỹ sư SmartTech sẽ hỗ trợ trọn gói hồ sơ thông báo và đấu nối kỹ thuật với Điện lực địa phương cho gia đình.`
  },
  {
    id: 've-smarttech',
    category: 'ThuongHieu',
    keywords: ['smarttech', 'ở đâu', 'tổng kho', 'uy tín', 'công ty'],
    question: 'SmartTech là đơn vị nào? Có uy tín không?',
    answer: `**Công ty TNHH Thương mại và Kỹ thuật SMARTTECH** là tổng thầu EPC và Top 4 Nhà phân phối chính thức thiết bị Sungrow tại Việt Nam:\n- Đã cung cấp hơn **37 MW biến tần Sungrow** và tổng thầu hàng loạt dự án công nghiệp trọng điểm (như KCN Phước Đông 3.4MW, Sheico 8MW, Worldon 15MW).\n- **Văn phòng:** Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh, MST: 3702675986.\n- **Tổng kho:** Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh, Việt Nam.\n- Hotline/Zalo kỹ thuật: **0984 807 679**.`
  }
];

export const DEFAULT_BOT_GREETING = `Xin chào anh/chị! Em là **Trợ lý Kỹ thuật AI của SmartTech**.\nEm có thể giải đáp nhanh về Inverter Sungrow, Tấm pin JA Solar, pin lưu trữ BESS hoặc các thủ tục lắp đặt điện mặt trời. Anh/chị đang quan tâm đến vấn đề nào dưới đây ạ?`;
