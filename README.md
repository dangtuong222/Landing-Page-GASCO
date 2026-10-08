# GASCOLAE — 15 landing page và trợ lý Gemini

Cả 15 trang có 15 trợ lý riêng theo mã dịch vụ, dùng `gemini-3.5-flash-lite`. Mỗi trợ lý chỉ tra cứu tài liệu của dịch vụ tương ứng, giữ lịch sử phiên chat riêng và hiển thị nguồn trích dẫn. Mỗi trang có một nút chat nổi; các khu vực hỏi đáp trong trang mở cùng hội thoại của dịch vụ đó. API key được giữ ở máy chủ, không nằm trong HTML/JavaScript.

Kho kiến thức được tạo từ **170 tài liệu** trong 15 thư mục bên cạnh dự án: 75 DOCX, 76 XLSX, 15 PPTX và 4 PDF, kể cả nguồn SRC và bản sao workbook. Đây là tra cứu tài liệu (RAG), không phải huấn luyện lại trọng số Gemini. Trợ lý có thể tổng hợp hồ sơ để trả lời câu hỏi mới; thông tin thiếu hoặc chưa xác minh cần được nêu rõ, không bảo đảm trả lời đúng mọi câu hỏi.

## Chạy trên máy hiện tại

API key và kho kiến thức đã được cấu hình cục bộ. Mở PowerShell trong thư mục dự án:

```powershell
node --env-file=.env server/index.mjs
```

Hoặc chạy `./Start-Chatbot.ps1`. Mở `http://127.0.0.1:8080/`, chọn dịch vụ rồi bấm **Hỏi trợ lý**. Giữ terminal mở; `Ctrl+C` để dừng. Nếu cổng 8080 đang có server do Codex chạy thì có thể dùng ngay link này. Chạy qua `file://` hay `python -m http.server` chỉ phục vụ trang tĩnh, không có backend Gemini.

## Cài trên máy khác

Cần Node.js 22 trở lên, Python 3.10 trở lên và thư mục tài liệu nguồn. Backend không cần package npm bổ sung.

```powershell
Copy-Item .env.example .env
# Điền GEMINI_API_KEY trong .env; không đưa key vào HTML/JavaScript.
python -m pip install -r scripts/requirements.txt
python scripts/ingest.py --source "D:/HK7/THUCTAP"
node --env-file=.env server/index.mjs
```

Trên máy có Codex, có thể dùng Python và thư viện đã được đóng gói:

```powershell
& "$env:USERPROFILE/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" scripts/ingest.py
```

## Nạp lại tài liệu

Chạy `scripts/ingest.py` sau khi sửa hồ sơ rồi khởi động lại backend. Script đọc tất cả DOCX/XLSX/PPTX/PDF và TXT/MD/CSV trong 15 thư mục dịch vụ, không sửa bản gốc. Nội dung website và ảnh tài nguyên không được xem là tài liệu kiến thức. DOCX giữ thứ tự đoạn và bảng; XLSX giữ nhãn, vị trí ô, công thức và giá trị lưu; PPTX gồm slide và notes; PDF giữ số trang. PDF không có lớp văn bản cần OCR trước. Nếu một file bị lỗi, script báo cụ thể và giữ index tốt trước đó.

`.knowledge/index.json` chứa văn bản riêng tư, SHA-256 tài liệu, nguồn, guardrail và câu hỏi kiểm thử. `.knowledge/manifest.json` ghi số tài liệu từng dịch vụ và lỗi nạp. `.knowledge/`, `.env` và `test-results/` bị loại khỏi Git và bị backend chặn truy cập HTTP.

## Phạm vi trợ lý

- Mỗi trang chỉ tra cứu hồ sơ đúng mã dịch vụ. Hỏi mã khác được hướng dẫn mở đúng landing page.
- Toàn bộ tài liệu được đọc cục bộ để kiểm kê. File `07_Service_*` không được đưa vào ngữ cảnh Gemini; câu hỏi giá, tính tiền hoặc chiết khấu được hướng dẫn sang Sales/Finance.
- Sheet kiểm thử lưu câu hỏi và hành vi mong đợi để đánh giá, không dùng làm dữ kiện cho model. Guardrail thực tế được lấy từ workbook 10.
- Khi trả lời, chỉ các đoạn liên quan của đúng dịch vụ cùng các quy tắc được gửi tới Gemini; không upload toàn bộ file hoặc fine-tuning. Người dùng được thông báo nội dung chat gửi tới Gemini.
- Hội thoại giữ trong bộ nhớ trang; tải lại hoặc chọn hội thoại mới sẽ xóa lịch sử. Máy chủ không lưu nội dung chat vào log hoặc cơ sở dữ liệu.
- Giao diện chat mẫu cũ được ẩn; các nút gợi ý và nút mở trợ lý dùng đúng chatbot của trang. CSS `display:none!important` ngăn nút cũ xuất hiện trùng với nút mới.
- Form đăng ký vẫn là demo. Chatbot không gửi lead, đặt lịch hoặc thực hiện chuyển tiếp đến chuyên viên; người dùng cần chủ động liên hệ.
- Trợ lý không tìm kiếm web. Quy định trong hồ sơ được giải thích theo thời điểm tài liệu, không tự xác nhận tính hiệu lực hiện tại.

## Kiểm thử

```powershell
npm test
npm run check:gemini
npm run eval:retrieval
npm run eval:live
```

`eval:retrieval` kiểm tra phạm vi tra cứu của các câu hỏi đã điền trong workbook 10; placeholder được thống kê riêng. `eval:live` gọi Gemini với một câu hỏi mỗi dịch vụ, lưu câu trả lời thực tế, nguồn và expected behavior tại `test-results/live-smoke.json`. Kiểm tra phạm vi/có phản hồi không đồng nghĩa đã đạt tất cả yêu cầu nội dung.

Để chạy toàn bộ câu hỏi đã điền bằng Gemini, dùng `node --env-file=.env scripts/evaluate.mjs --live --all`. Lệnh này dùng quota Gemini theo số câu hỏi. Báo cáo có observed outputs để review, không tự gán PASS cho độ đúng chuyên môn. Các kiểm thử tự động bao gồm phạm vi 15 dịch vụ, lịch sử, dữ liệu đầu vào, lỗi Gemini, API HTTP, CORS GitHub Pages và bảo vệ file riêng tư.

## Hosting

Frontend giữ trên GitHub Pages. Thẻ script của mỗi trang có `data-api-base` trỏ tới backend HTTPS riêng; khi chạy localhost, chatbot tự dùng Node API cùng origin. GitHub Pages chỉ phục vụ nội dung tĩnh, vì vậy không thể dùng `/api/chat` trên tên miền GitHub Pages.

API hiện tại: `https://gascolae-service-chat.almondlark.chatgpt.site/api/`. Chỉ endpoint HTTPS được đưa vào mã frontend, không có API key hoặc tài liệu nguyên bản.

**Trạng thái kiểm tra ngày 08/10/2026:** frontend và backend HTTPS đã được xuất bản. Gọi API từ terminal trả lời thành công, nhưng kiểm tra trực tiếp trên trình duyệt tại Việt Nam gặp `GEMINI_REGION`: Google từ chối vị trí máy chủ. Sites chưa áp dụng placement từ cấu hình Wrangler đi kèm; chưa thể xác nhận chatbot dùng được ổn định cho khách trên GitHub Pages. Cần triển khai backend qua tài khoản hosting cho phép chọn vùng rồi kiểm tra lại từ trình duyệt.

Backend triển khai bằng Cloudflare Worker qua Sites, cho phép CORS từ `https://dangtuong222.github.io`, xử lý preflight và gọi Gemini bằng secret máy chủ. `server/worker.mjs` dùng cùng bộ tra cứu và quy tắc với backend Node. `node scripts/prepare-chat-host.mjs` tạo checkout riêng tư `.chat-host/` với 15 kho dịch vụ trong bundle máy chủ; không đưa checkout này, tài liệu hoặc secret lên repository GitHub Pages. Nạp lại tài liệu và triển khai lại backend sau khi cập nhật hồ sơ. Để thay endpoint, chạy `node scripts/configure-chat-api.mjs https://your-backend.example/api/` rồi push frontend.

Đã chuẩn bị `.chat-host/dist/server/wrangler.json` với `placement.region = gcp:us-central1` để triển khai trực tiếp qua tài khoản Cloudflare. Khi được cấp quyền hosting, triển khai bundle này, đặt Gemini secret bằng công cụ hosting, kiểm tra `/api/health` và câu hỏi thực tế từ GitHub Pages trước khi cập nhật endpoint. Cấu hình vùng chỉ có hiệu lực khi hosting áp dụng nó.

S0075/S0064/S0061 tiếp tục được trợ lý mô tả là hồ sơ nghiên cứu nội bộ, chỉ hỗ trợ review và không cam kết triển khai.

Đặt `GEMINI_API_KEY` và `GEMINI_MODEL` bằng biến môi trường của hosting. Backend giới hạn 20 request/phút theo IP và 4 request Gemini đồng thời mỗi process/isolate. Giới hạn Worker nằm trong bộ nhớ từng isolate; vận hành nhiều instance cần giới hạn dùng chung nếu cần quota toàn hệ thống. Bản Node vẫn dùng `node server/index.mjs` và mặc định `HOST=127.0.0.1` để xem trên máy.

Không upload toàn bộ thư mục này như site tĩnh vì `.env`, `.knowledge/` và kết quả kiểm thử là dữ liệu riêng tư. Backend chỉ phục vụ HTML và tài nguyên website được phép.

Tài liệu tích hợp: [GenerateContent API](https://ai.google.dev/api/generate-content), [quản lý API key Gemini](https://ai.google.dev/gemini-api/docs/api-key).

Nếu bài kiểm thử đầy đủ gặp giới hạn Gemini, kết quả một phần được lưu và chương trình dừng gửi thêm. Sau khi quota khả dụng, dùng `node --env-file=.env scripts/evaluate.mjs --live --all --resume` để chạy tiếp chỉ các câu chưa có phản hồi thành công.
