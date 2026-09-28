# MISSION: XÂY DỰNG WEB APP "XB SOLAR RESIDENTIAL HUB - PHASE 1 MVP"

Bạn là Senior Front-end Developer & Solution Architect. Hãy xây dựng một ứng dụng Web tương tác cao, hiện đại và chuẩn Responsive (Mobile First) cho "XB Solar Residential Hub".

## 1. TECH STACK BẮT BUỘC:
- Framework: React (Vite)
- Styling: Tailwind CSS (Theme Dark Slate & Gold/Emerald Solar accents)
- Icon set: Lucide-react
- Biểu đồ: Recharts
- Xuất Báo giá: jspdf + jspdf-autotable hoặc html2pdf.js

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN:
src/
├── assets/ (Logo XB Solar, icons)
├── components/
│   ├── Header.jsx (Branding XBSolar, Hotline 08.9811.0068, Hotline Zalo)
│   ├── CalculatorStep/
│   │   ├── BillInputStep.jsx (Slider tiền điện, Tỉnh thành, Nhu cầu dùng điện)
│   │   ├── ResultCompareStep.jsx (So sánh Gói Hòa lưới vs Gói Hybrid Sungrow)
│   │   └── RoiChartStep.jsx (Biểu đồ hoàn vốn và dòng tiền tiết kiệm 25 năm)
│   ├── QuoteModal.jsx (Form thu thập lead: Tên, SĐT, Địa chỉ & Nút tải PDF)
│   └── Footer.jsx (Thông tin tổng kho Long Trường, VPGD Lake View City)
├── data/
│   └── solarData.js (Dữ liệu thiết bị Sungrow, JA Solar, giá điện EVN, PSH)
├── utils/
│   ├── solarCalculator.js (Hàm tính toán kỹ thuật & tài chính)
│   └── pdfExport.js (Template xuất báo giá PDF chuyên nghiệp)
├── App.jsx
└── main.jsx