# Lịch Sử Phiên Làm Việc - XB Solar Hub (Ngày 27/09/2026)

Tệp này ghi lại toàn bộ các công việc đã thực hiện, các quyết định kiến trúc và hướng dẫn dành cho AI Agent tiếp theo để tiếp tục phát triển dự án.

## 1. Mục tiêu đã hoàn thành
- **Chuyển đổi thành công** ứng dụng vẽ sơ đồ Layout/3D từ nền tảng Vanilla HTML (`solar_layout_app.html`) sang tích hợp hoàn chỉnh vào ứng dụng React hiện đại (`XB Solar Hub`).
- Ứng dụng vẽ hiện tại chạy mượt mà bên trong iframe (`SolarDesigner.jsx`), cho phép tận dụng toàn bộ sức mạnh của mã nguồn cũ mà không làm hỏng cấu trúc React mới.

## 2. Cập nhật Nhận diện Thương hiệu & Cấu hình
- **Thương hiệu:** Thay thế toàn bộ thương hiệu cũ ("Solar 24h") thành **"XB SOLAR"**.
- **Thông tin liên hệ:** Cập nhật Hotline (08.9811.0068), Email (cskh@xbsolar.vn), Địa chỉ (38 Song Hành, Lake View City) và Tên Giám đốc (HỒ NGỌC PHƯƠNG).
- **Logo:** Đã đồng bộ sử dụng logo `logo-smarttech-nbg.png` xuyên suốt phần mềm và trên bản in PDF.
- **Màu sắc:** Chuyển đổi màu chủ đạo sang Xanh đen công nghệ (Navy Slate `#0f172a`) và Vàng Cam (Amber `#f59e0b`).
- **Danh mục thiết bị:**
  - Tấm pin: Cập nhật thành JA Solar 610W, JA Solar 630W, Jinko 580W.
  - Inverter & Pin lưu trữ: Chuyển sang toàn bộ hệ sinh thái của hãng **Sungrow** (SG10RS, SH10RT, SBR096, MBL160...).

## 3. Kiến trúc tích hợp (Cực kỳ quan trọng cho Agent sau)
- **Cơ chế Build:** Bất kỳ thay đổi nào đối với công cụ Designer đều KHÔNG được chỉnh sửa trực tiếp vào file `public/solar_designer_xb.html`. File này là file được tự động sinh ra.
- **Quy trình chuẩn:** 
  1. Chỉnh sửa logic lõi tại `solar_layout_app.html`.
  2. Các logic tiêm (inject) dữ liệu, đổi màu, đổi logo được lập trình tại script `convert_solar_designer.cjs`.
  3. Chạy lệnh `node convert_solar_designer.cjs` để xuất ra file `public/solar_designer_xb.html` cuối cùng.
- **Giao tiếp React <-> Iframe:** Ứng dụng React truyền dữ liệu (ví dụ: Số lượng tấm pin khách hàng nhập từ màn hình trước) vào iframe thông qua cơ chế `window.postMessage('SET_INITIAL_QTY')`. Iframe sẽ tự động bắt sự kiện và vẽ sơ đồ 3D tương ứng.

## 4. Đại tu hệ thống xuất PDF (Lịch sử fix bug)
- **Vấn đề ban đầu:** Hệ thống xuất PDF cũ sử dụng thư viện `html2pdf.js` liên tục bị treo (hang) do không xử lý nổi DOM phức tạp và hàng loạt ảnh Base64 từ Canvas 2D/3D.
- **Giải pháp dứt điểm:** Đã **loại bỏ hoàn toàn html2pdf**. Hệ thống hiện tại sử dụng kiến trúc hoàn toàn mới:
  1. Dùng `htmlToImage.toJpeg()` (thư viện gốc vốn đang chạy rất ổn định để chụp ảnh 3D) để "chụp" 6 trang layout thành 6 bức ảnh JPEG siêu nét (`pixelRatio: 1.5`).
  2. Dùng thư viện lõi `jsPDF` (`window.jspdf`) để ghép 6 bức ảnh này thành 1 file PDF nguyên khối và tải về.
- **Bảo vệ chống crash (Image Fallback):** Cấu hình thêm thuộc tính `imagePlaceholder` cho `htmlToImage`. Nếu trong quá trình chụp PDF có bất kỳ ảnh nào bị lỗi 404 (ví dụ lỗi mạng, lỗi load logo), hệ thống sẽ điền 1 pixel trong suốt thay vì ném ra lỗi `[object Event]` làm treo toàn bộ quy trình xuất PDF như trước.
- **UI/UX Cover Page:** Đã căn chỉnh CSS (`white-space: nowrap`) trên trang bìa PDF để đảm bảo tiêu đề "BẢN VẼ THIẾT KẾ" không bao giờ bị rớt dòng lộn xộn.

## 5. Nhiệm vụ tiếp theo (Next Steps cho Agent)
- Kiểm tra tính đồng bộ state (trạng thái) từ các Component khác trong React truyền vào `SolarDesigner` nếu người dùng có yêu cầu thêm tính năng tương tác.
- Tinh chỉnh các Component React còn lại (`BrandTrust.jsx`, `EpcProcess.jsx`, `ProjectShowcase.jsx`) để hoàn thiện luồng giao diện tổng thể của website XB Solar Hub.
- Tự do sáng tạo và nâng cấp các hiệu ứng Animation/Micro-interactions trên React.
