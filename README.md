# GASCOLAE — 15 landing page và trợ lý Gemini

Chatbot đã nối vào cả 15 trang, dùng `gemini-3.5-flash-lite`. API key được đọc ở máy chủ từ `.env`; trình duyệt chỉ gọi `/api/chat`. Trợ lý tra cứu đúng dịch vụ, giữ lịch sử phiên chat và hiển thị tên file cùng vị trí nguồn trích dẫn.

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
- Các nút và form chat cũ mở cùng một cuộc hội thoại thật, không chạy phản hồi giả lập. Widget ngoài ở trang 01 đã được thay bằng chatbot chung.
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

Để chạy toàn bộ câu hỏi đã điền bằng Gemini, dùng `node --env-file=.env scripts/evaluate.mjs --live --all`. Lệnh này dùng quota Gemini theo số câu hỏi. Báo cáo có observed outputs để review, không tự gán PASS cho độ đúng chuyên môn. Có 8 kiểm thử tự động về phạm vi nguồn, lịch sử, dữ liệu đầu vào, lỗi Gemini, API HTTP và bảo vệ file riêng tư.

## Hosting

Bản này đang chạy **cục bộ**, chưa deploy. S0075/S0064/S0061 giữ trạng thái bản nháp nội bộ; chatbot dùng cho review tại máy. Việc công bố nội dung và sử dụng dữ liệu trên hosting cần được xác nhận theo hồ sơ nguồn.

Chatbot cần hosting chạy **Node backend** hoặc API tương đương qua reverse proxy cùng origin. GitHub Pages và upload site tĩnh đơn thuần không chạy được API chat.

Trên hosting, đặt `GEMINI_API_KEY` và `GEMINI_MODEL` bằng biến môi trường, giữ knowledge index trong vùng riêng tư, chạy `node server/index.mjs`. Mặc định `HOST=127.0.0.1` để xem trên máy; chỉ dùng `HOST=0.0.0.0` khi đã thiết lập kiểm soát truy cập phù hợp. TLS/reverse proxy do hosting cung cấp. Backend giới hạn 20 request/phút theo địa chỉ kết nối và 4 request Gemini đồng thời mỗi process; cần điều chỉnh cho reverse proxy/số instance khi vận hành thực tế.

Không upload toàn bộ thư mục này như site tĩnh vì `.env`, `.knowledge/` và kết quả kiểm thử là dữ liệu riêng tư. Backend chỉ phục vụ HTML và tài nguyên website được phép.

Tài liệu tích hợp: [GenerateContent API](https://ai.google.dev/api/generate-content), [quản lý API key Gemini](https://ai.google.dev/gemini-api/docs/api-key).

Nếu bài kiểm thử đầy đủ gặp giới hạn Gemini, kết quả một phần được lưu và chương trình dừng gửi thêm. Sau khi quota khả dụng, dùng `node --env-file=.env scripts/evaluate.mjs --live --all --resume` để chạy tiếp chỉ các câu chưa có phản hồi thành công.
