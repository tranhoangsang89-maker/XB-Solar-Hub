# Lịch Sử Phiên Làm Việc - Smart Tech Hub (Ngày 27/09/2026)

Tệp này ghi lại toàn bộ các công việc đã thực hiện, các quyết định kiến trúc và hướng dẫn dành cho AI Agent tiếp theo để tiếp tục phát triển dự án.

## 1. Mục tiêu đã hoàn thành
- **Chuyển đổi thành công** ứng dụng vẽ sơ đồ Layout/3D từ nền tảng Vanilla HTML (`solar_layout_app.html`) sang tích hợp hoàn chỉnh vào ứng dụng React hiện đại (`Smart Tech Hub`).
- Ứng dụng vẽ hiện tại chạy mượt mà bên trong iframe (`SolarDesigner.jsx`), cho phép tận dụng toàn bộ sức mạnh của mã nguồn cũ mà không làm hỏng cấu trúc React mới.

## 2. Cập nhật Nhận diện Thương hiệu & Cấu hình
- **Thương hiệu:** Thay thế toàn bộ thương hiệu cũ ("Solar 24h") thành **"SMARTTECH"**.
- **Thông tin liên hệ:** Cập nhật Hotline (0984 807 679), Email (info@smarttech.vn), Địa chỉ (Số 1 Nổi, Phường Long Trường, TP. Hồ Chí Minh) và Tên Giám đốc (Nguyễn Thế Anh).
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

## 5. Cập nhật Báo Giá & Tối ưu UI (Ngày 28/09/2026)
- **Kiến trúc Bảng Dự Toán (BoM):** Chuyển đổi logic báo giá từ "Top-down" sang "Bottom-up". Tích hợp logic bóc tách vật tư chi tiết từ dự án cũ (bỏ tính năng trả góp Shinhan Bank).
- **Trải nghiệm người dùng (UX):** 
  - Cải tiến dropdown chọn Tỉnh/Thành phố thành dạng Searchable Combobox chuyên nghiệp.
  - Xây dựng hệ thống Custom Dropdown tuỳ chỉnh vật tư (Tấm pin JA Solar/Jinko, Inverter/Pin lưu trữ Sungrow/Deye) ngay trong Bảng dự toán (QuoteModal). Cho phép thay đổi Tên, Đơn giá, Số lượng theo thời gian thực.
- **Tích hợp hình ảnh trực quan:** Bổ sung ảnh minh hoạ thực tế cho toàn bộ vật tư (Tấm pin, Inverter, Pin lưu trữ, Tủ điện, Khung ray, Cáp điện, Nhân công). Ảnh hiển thị đẹp mắt cả trên giao diện Web và trong tệp PDF xuất ra.

## 6. Hoàn thiện PDF Báo Giá & Khắc phục giao diện (Ngày 28/09/2026)
- Tích hợp `jspdf-autotable` kết hợp tiền xử lý ảnh (`Blob` -> `Base64`) để nhúng hình ảnh sản phẩm vào trong bảng báo giá PDF một cách mượt mà.
- Khắc phục triệt để lỗi tràn layout ngang trên Web do chèn thêm ảnh (cập nhật chiều rộng Modal lên `max-w-6xl` và co giãn input).
- **Tối ưu không gian dọc PDF:** Tinh chỉnh line-height, cell padding và size ảnh xuống mức vừa vặn (`8`) để ép toàn bộ bảng vật tư, hiệu quả tài chính và điều khoản nằm gọn gàng, hoàn hảo trên đúng 1 trang A4 duy nhất, tránh tình trạng bị ngắt trang lở dở.

## 7. Triển khai (Deployment) & Tích hợp (Ngày 28/09/2026)
- **Kiểm định mã nguồn:** Chạy `npm run build` thành công, kiểm tra thư viện ổn định 100%.
- **Upload mã nguồn:** Tự động hoá lệnh Git, Commit toàn bộ code sạch và Push lên Repository GitHub mới của người dùng (`tranhoangsang89-maker/Smart-Tech-Hub`).
- **Triển khai Vercel & AI Chatbot:** Hướng dẫn luồng deploy Vercel và cấu hình biến môi trường `VITE_GEMINI_API_KEY` (Sử dụng model Gemini Flash-Lite) trên Production, đảm bảo trợ lý ảo SmartTech luôn trực tuyến thông minh.
- **SEO & Social Preview (Open Graph):** Bổ sung đầy đủ các thẻ meta OG và Twitter Cards vào `index.html`. Sử dụng URL ảnh tuyệt đối (`https://smarttech-hub.vercel.app/og-meta-tags-xb.png`) để đảm bảo hình ảnh bìa và thông điệp marketing hiển thị chính xác khi chia sẻ link lên các MXH khó tính như Zalo, Facebook.

## 8. Nhiệm vụ tiếp theo (Next Steps cho Agent tới)
- Theo dõi sự ổn định của hệ thống trên môi trường Production (Vercel).
- Tiếp nhận phản hồi từ khách hàng thực tế để tinh chỉnh thông số tài chính nếu cần.
- Có thể phát triển thêm tính năng Đăng nhập/Lưu lịch sử báo giá cho Sale nếu SmartTech muốn mở rộng quy mô.

## 9. Tái cấu trúc & Hoàn thiện Giao diện (Ngày 04/10/2026)
- **Tái định vị Thương hiệu:** Loại bỏ hoàn toàn chữ "HUB" khỏi mọi ngóc ngách của hệ thống. Tên gọi chính thức được chuẩn hoá là **SMARTTECH** (viết liền, không khoảng trắng) với bộ mã màu nhận diện đúng chuẩn logo: "SMART" màu xanh dương (`text-blue-600`), "TECH" màu xanh lá sáng (`text-green-500`).
- **Giao diện Eco Green (Năng lượng xanh):** Đại tu toàn bộ bảng màu UI từ giao diện tối (Dark Slate) sang phong cách sáng, tươi mới, tràn đầy năng lượng đúng chất năng lượng xanh (Emerald/Teal/Amber).
- **Hero Section & Video Cinematic:** Thay đổi hoàn toàn bố cục trang chủ. Nhúng video toàn màn hình (Full-width banner video) độc lập ở ngay trên cùng trang web. Video hiện tại được ghim cứng tại `public/video-st-logo3.mp4` với đầy đủ các tuỳ chọn HTML5 chuẩn mobile (`autoplay`, `muted`, `playsinline`, `loop`) đảm bảo phát video mượt mà trên mọi trình duyệt.
- **Header & Footer:** Dời phần địa chỉ trụ sở ("Số 1 Nổi...") từ Footer lên khoảng trống giữa của Header để tăng độ uy tín ngay từ cái nhìn đầu tiên. Đổi Slogan thành tiếng Việt "Giải pháp điện mặt trời cho mọi nhà" (màu cam).
- **Trợ lý Ảo AI:** Cập nhật lại màu chữ của Chatbot thành xanh mòng két đậm (`text-teal-900`) để tăng độ tương phản (contrast), chống hiện tượng chữ bị chìm khi đổi màu nền khung chat sang màu sáng (`bg-emerald-100`).
- **Xuất PDF Siêu Chuẩn:** Tái căn chỉnh lại toạ độ Header trong tệp PDF xuất ra. Fix lỗi aspect-ratio khiến Logo bị bóp méo (canh chuẩn khung vuông `26x26`), dời vị trí text cho cân xứng, cập nhật Slogan, đổi màu text SMARTTECH, và thêm tên giám đốc "Mr. Thế Anh" vào đuôi số Hotline để tăng tính thân thiện.
- **Triển khai liên tục:** Cập nhật file liên tục qua Git, đẩy source code lên nhánh `main` để Vercel tự động deploy ra Production cho người dùng test.
