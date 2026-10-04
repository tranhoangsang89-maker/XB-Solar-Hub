// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatVnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatNumber = (n) =>
  new Intl.NumberFormat('vi-VN').format(n);

async function getBase64FromUrl(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to load image', e);
    return null;
  }
}

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

export async function exportQuotePDF({ customerName, customerPhone, result, selectedType, monthlyBill, province, bomItems, totalPrice, chartImageBase64 }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 15;

  await addVietnameseFont(doc);

  // ── Header Background ─────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, 50, 'F');

  // Fetch and Add Logo
  const logoBase64 = await getBase64FromUrl('/logo-smarttech-nbg.png');
  let textStartX = margin;
  if (logoBase64) {
    // Logo is roughly square, making it 26x26
    doc.addImage(logoBase64, 'PNG', margin, 10, 26, 26);
    textStartX = margin + 32; // shift text to the right of the logo
  }

  // Company name
  doc.setFontSize(22);
  doc.setFont('Roboto', 'bold');
  
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('SMART', textStartX, 22);
  
  const smartWidth = doc.getTextWidth('SMART');
  doc.setTextColor(34, 197, 94); // green-500
  doc.text('TECH', textStartX + smartWidth, 22);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Residential Energy Solutions', textStartX, 29);

  // Right side header info
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Hotline/Zalo: 0984 807 679 (Mr. Thế Anh)', W - margin, 18, { align: 'right' });
  doc.text('VPGD: Lake View City, Q.8, TP.HCM', W - margin, 24, { align: 'right' });
  doc.text('Kho: Số 1 Nổi, P. Long Trường, Q.9, TP.HCM', W - margin, 30, { align: 'right' });

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
    { 
      content: 'TỔNG CỘNG (Chưa VAT)', 
      colSpan: 5, 
      styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 251, 235], textColor: [15, 23, 42], valign: 'middle', cellPadding: { right: 4, top: 4, bottom: 4 } } 
    },
    { 
      content: formatVnd(totalPrice), 
      styles: { fontStyle: 'bold', fillColor: [255, 251, 235], textColor: [15, 23, 42], valign: 'middle', cellPadding: { top: 4, bottom: 4 } } 
    }
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
      // Empty, specific row styles are handled via object syntax
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

  // ── Chart ─────────────────────────────────────────────────────────────────
  if (chartImageBase64) {
    y += 10;
    if (y > H - 80) { doc.addPage(); y = 20; }
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LỢI NHUẬN RÒNG TÍCH LŨY (VNĐ)', margin, y);
    y += 5;
    
    const imgWidth = W - 2 * margin;
    const imgHeight = imgWidth * 0.45;
    
    doc.addImage(chartImageBase64, 'PNG', margin, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  } else {
    y += 10;
  }

  // ── Terms & Signature ─────────────────────────────────────────────────────
  if (y > H - 70) { doc.addPage(); y = 20; }

  const startY = y;
  
  // HELPER: render wrapped text
  const renderText = (text, x, yOffset, isBold, color, extraPadding = 1) => {
    doc.setFont('Roboto', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, 100);
    doc.text(lines, x, yOffset);
    return yOffset + lines.length * 3.6 + extraPadding;
  };

  doc.setFontSize(8); // Reduced from 9
  
  // 1
  y = renderText('1. PHẠM VI CUNG CẤP', margin, y, true, [30, 64, 175], 0.5);
  y = renderText('Cung cấp và lắp đặt trọn gói theo nội dung đã liệt kê ở trên.', margin + 5, y, false, [30, 41, 59], 2.5);
  
  // 2
  y = renderText('2. PHƯƠNG THỨC THANH TOÁN: CHUYỂN KHOẢN / TIỀN MẶT', margin, y, true, [30, 64, 175], 0.5);
  y = renderText('- Đợt 01: tạm ứng 40% giá trị hợp đồng ngay sau hai bên ký kết hợp đồng có hiệu lực.', margin + 5, y, false, [30, 41, 59], 0.5);
  y = renderText('- Đợt 02: 40% giá trị hợp đồng sau khi đơn vị thi công tập kết vật tư thiết bị đến địa điểm lắp đặt.', margin + 5, y, false, [30, 41, 59], 0.5);
  y = renderText('- Đợt 3: 20% giá trị hợp đồng sau khi đơn vị thi công lắp đặt hoàn thành.', margin + 5, y, false, [30, 41, 59], 2.5);
  
  // 3
  y = renderText('3. TIẾN ĐỘ THI CÔNG:', margin, y, true, [30, 64, 175], 0.5);
  y = renderText('Trong vòng 30 ngày kể từ ngày ký hợp đồng và phê duyệt bản vẽ. (Thoả thuận 2 bên)', margin + 5, y, false, [30, 41, 59], 2.5);
  
  // 4
  y = renderText('4. BẢO HÀNH:', margin, y, true, [30, 64, 175], 0.5);
  y = renderText('12 năm cho tấm quang điện, 5 năm cho bộ biến Tần và 1 năm cho các thiết bị còn lại.', margin + 5, y, false, [220, 38, 38], 0.5);
  y = renderText('Xin vui lòng liên hệ với chúng tôi nếu Quý khách cần thêm thông tin.', margin + 5, y, false, [220, 38, 38], 0);

  // RIGHT SIDE: Signature
  let sigY = startY;
  doc.setFont('Roboto', 'bold');
  doc.setFontSize(8.5); // Reduced from 9
  doc.setTextColor(15, 23, 42);
  
  const rightColCenter = W - margin - 40;

  // Split company name to avoid overlapping
  const companyNameLines = doc.splitTextToSize('CÔNG TY TNHH THƯƠNG MẠI VÀ KỸ THUẬT SMARTTECH', 70);
  doc.text(companyNameLines, rightColCenter, sigY, { align: 'center' });
  sigY += companyNameLines.length * 4 + 2;
  
  doc.text('Giám Đốc', rightColCenter, sigY, { align: 'center' });
  
  sigY += 25; // space for signature
  doc.text('NGUYỄN THẾ ANH', rightColCenter, sigY, { align: 'center' });


  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = H - 18;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, footerY, W, 18, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.text(
    'Smart Tech Hub | Hotline/Zalo: 0984 807 679 | VPGD: Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh | MST: 3702675986',
    W / 2, footerY + 7, { align: 'center' }
  );
  doc.setTextColor(245, 158, 11);
  doc.text('Cảm ơn Quý Khách đã tin tưởng Smart Tech Hub!', W / 2, footerY + 13, { align: 'center' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `SmartTech_BaoGia_${customerName?.replace(/\s+/g, '_') || 'KhachHang'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}.pdf`;
  doc.save(fileName);
}
