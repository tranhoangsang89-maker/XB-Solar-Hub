// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatVnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatNumber = (n) =>
  new Intl.NumberFormat('vi-VN').format(n);

// Hàm hỗ trợ nạp font Roboto từ CDN
async function addVietnameseFont(doc) {
  try {
    const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
    const fontBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';
    
    const [regularBytes, boldBytes] = await Promise.all([
      fetch(fontUrl).then(res => res.arrayBuffer()),
      fetch(fontBoldUrl).then(res => res.arrayBuffer())
    ]);
    
    const toBase64 = buffer => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };

    doc.addFileToVFS('Roboto-Regular.ttf', toBase64(regularBytes));
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    
    doc.addFileToVFS('Roboto-Bold.ttf', toBase64(boldBytes));
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    
    doc.setFont('Roboto');
  } catch (e) {
    console.error('Không tải được font tiếng Việt:', e);
  }
}

export async function exportQuotePDF({ customerName, customerPhone, result, selectedType, monthlyBill, province, bomItems, totalPrice }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 15;

  await addVietnameseFont(doc);

  // ── Header Background ─────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, 50, 'F');

  // Company name
  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(22);
  doc.setFont('Roboto', 'bold');
  doc.text('XB SOLAR HUB', margin, 20);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Năng lượng mặt trời thường trú - Giải pháp toàn diện Sungrow & JA Solar', margin, 27);

  // Right side header info
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Hotline/Zalo: 08.9811.0068', W - margin, 18, { align: 'right' });
  doc.text('VPGD: Lake View City, Q.8, TP.HCM', W - margin, 24, { align: 'right' });
  doc.text('Kho: Long Trường, Q.9, TP.HCM', W - margin, 30, { align: 'right' });

  // Title bar
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 42, W, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BÁO GIÁ HỆ THỐNG ĐIỆN MẶT TRỜI CHÍNH THỨC', W / 2, 49, { align: 'center' });

  // ── Customer Info ─────────────────────────────────────────────────────────
  let y = 60;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('Roboto', 'bold');
  doc.text('THÔNG TIN KHÁCH HÀNG', margin, y);
  y += 2;
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 6;

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const plan = result[selectedType || 'hybrid'];
  const infoRows = [
    ['Họ và tên:', customerName || 'Khách hàng'],
    ['SĐT / Zalo:', customerPhone || '---'],
    ['Tỉnh / Thành phố:', province || '---'],
    ['Hóa đơn điện TB/tháng:', formatVnd(monthlyBill)],
    ['Gói giải pháp:', plan.combo.name],
    ['Công suất lắp đặt:', `${plan.combo.systemCapacityKwp} kWp`],
    ['Sản lượng ước tính:', `${formatNumber(plan.monthlyGenKwh)} kWh/tháng`],
    ['Ngày báo giá:', new Date().toLocaleDateString('vi-VN')],
  ];

  infoRows.forEach(([label, value]) => {
    doc.setFont('Roboto', 'bold');
    doc.text(label, margin, y);
    doc.setFont('Roboto', 'normal');
    doc.text(value, margin + 55, y);
    y += 4.5;
  });

  // Preload images as base64
  const loadedImages = {};
  for (const item of bomItems) {
    if (item.image && !loadedImages[item.image]) {
       try {
         const res = await fetch(item.image);
         const blob = await res.blob();
         const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
         });
         loadedImages[item.image] = base64;
       } catch (e) {
         console.warn("Could not load image", item.image);
       }
    }
  }

  // ── BOM Table ─────────────────────────────────────────────────────────────
  y += 4;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('BẢNG DỰ TOÁN VẬT TƯ & THIẾT BỊ', margin, y);
  y += 2;
  doc.setDrawColor(15, 23, 42);
  doc.line(margin, y, W - margin, y);
  y += 5;

  const tableData = bomItems.map((item, index) => [
    index + 1,
    item.name,
    item.unit,
    formatNumber(item.qty),
    formatVnd(item.price),
    formatVnd(item.total)
  ]);

  // Thêm dòng tổng cộng
  tableData.push([
    '', 'TỔNG CỘNG (Chưa VAT)', '', '', '', formatVnd(totalPrice)
  ]);

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { font: 'Roboto', fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { font: 'Roboto', fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['STT', 'Hạng mục vật tư', 'ĐVT', 'SL', 'Đơn giá', 'Thành tiền']],
    body: tableData,
    columnStyles: { 
      0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 
      1: { cellWidth: 70, cellPadding: { left: 14, top: 2, bottom: 2 } }, 
      2: { cellWidth: 15, halign: 'center', valign: 'middle' },
      3: { cellWidth: 15, halign: 'center', valign: 'middle' },
      4: { halign: 'right', valign: 'middle' },
      5: { halign: 'right', fontStyle: 'bold', valign: 'middle' }
    },
    didDrawCell: function (data) {
      // Draw image in column 1 for items
      if (data.column.index === 1 && data.row.index < bomItems.length) {
        const item = bomItems[data.row.index];
        if (item && item.image && loadedImages[item.image]) {
          const imgBase64 = loadedImages[item.image];
          const imgSize = 8;
          // draw image left-aligned, vertically centered
          doc.addImage(imgBase64, 'JPEG', data.cell.x + 2, data.cell.y + (data.cell.height - imgSize) / 2, imgSize, imgSize);
        }
      }
    },
    didParseCell: function (data) {
      // Style cho dòng tổng cộng
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fillColor = [255, 251, 235]; // amber-50
        data.cell.styles.textColor = [15, 23, 42];
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
          data.cell.styles.cellPadding = { left: 2, right: 2 }; // reset padding
        }
      }
    }
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Financial Summary ─────────────────────────────────────────────────────
  // Check if we need a new page
  if (y > H - 65) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text('HIỆU QUẢ TÀI CHÍNH DỰ KIẾN', margin, y);
  y += 2;
  doc.setDrawColor(16, 185, 129);
  doc.line(margin, y, W - margin, y);
  y += 5;

  const finance = plan.finance;
  const financeRows = [
    ['Tiết kiệm ước tính mỗi tháng:', formatVnd(finance.monthlySavings)],
    ['Thời gian hoàn vốn ước tính:', `${finance.paybackYears} năm`],
    ['Tổng lợi nhuận ròng sau 25 năm:', formatVnd(finance.total25YearSavings)]
  ];

  financeRows.forEach(([label, value]) => {
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(label, margin, y);
    doc.setFont('Roboto', 'bold');
    doc.text(value, margin + 55, y);
    y += 5.5;
  });

  // ── Terms ─────────────────────────────────────────────────────────────────
  y += 5;
  if (y > H - 50) { doc.addPage(); y = 20; }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, W - 2 * margin, 28, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, W - 2 * margin, 28, 2, 2, 'S');
  y += 5;

  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ĐIỀU KHOẢN BÁO GIÁ', margin + 4, y);
  y += 5;

  doc.setFont('Roboto', 'normal');
  doc.setFontSize(7.5);
  const terms = [
    '• Báo giá có hiệu lực trong 15 ngày kể từ ngày phát hành.',
    '• Giá trên chưa bao gồm VAT 8%. Giá đã bao gồm thi công lắp đặt, kiểm tra và kỹ thuật.',
    '• Bảo hành: Inverter Sungrow 5 năm, Tấm pin JA Solar 12 năm (vật lý) và 25-30 năm (hiệu suất).',
    '• Phương thức thanh toán: Đợt 1: 50% khi ký hợp đồng. Đợt 2: 40% trước khi lắp đặt. Đợt 3: 10% sau nghiệm thu.',
  ];
  terms.forEach((t) => {
    doc.text(t, margin + 4, y);
    y += 4.5;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = H - 18;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, footerY, W, 18, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.text(
    'XB Solar Hub | Hotline/Zalo: 08.9811.0068 | VPGD: Lake View City, Q.8, TP.HCM | Tổng kho: Long Trường, Q.9, TP.HCM',
    W / 2, footerY + 7, { align: 'center' }
  );
  doc.setTextColor(245, 158, 11);
  doc.text('Cảm ơn Quý Khách đã tin tưởng XB Solar Hub!', W / 2, footerY + 13, { align: 'center' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `XBSolar_BaoGia_${customerName?.replace(/\s+/g, '_') || 'KhachHang'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.pdf`;
  doc.save(fileName);
}
