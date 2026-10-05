# GASCOLAE — Trung tâm 15 dịch vụ UAV

Thư mục này là một website tĩnh hoàn chỉnh, không cần cài package hoặc chạy bước build.

## Cấu trúc thư mục

- `index.html` — dashboard trung tâm dịch vụ
- `landing_page_01/` đến `landing_page_15/` — nội dung và tài nguyên riêng của từng dịch vụ
- `assets/` — CSS, JavaScript và ảnh dùng chung
- `404.html` — trang báo đường dẫn không tồn tại
- `.nojekyll` — tắt xử lý Jekyll khi phục vụ website tĩnh qua GitHub Pages

## Cấu trúc URL

- `/` — dashboard tổng, có tìm kiếm và bộ lọc dịch vụ
- `/landing_page_01/` đến `/landing_page_15/` — 15 landing page
- Mỗi landing page có thanh điều hướng cuối trang để quay về dashboard hoặc chuyển sang dịch vụ tiếp theo; trang 15 quay vòng về trang 01.

Các đường dẫn đều là đường dẫn tương đối, nên website chạy được cả ở domain riêng và ở subpath như GitHub Pages.

## Ba hồ sơ nghiên cứu mới

| Trang | Mã | Nội dung |
| --- | --- | --- |
| `landing_page_13/` | S0075 | Tuần tra biên giới VTOL 50–100 km |
| `landing_page_14/` | S0064 | Giám sát kho đạn dược & nhiên liệu bằng UAV nhiệt–khí |
| `landing_page_15/` | S0061 | Kiểm tra nhiệt nguồn điện phục vụ quốc phòng |

Nội dung được biên tập từ các file `09_Service_Landing_Page_Content.docx` tương ứng trong thư mục thực tập. Ba trang giữ trạng thái **bản nháp nội bộ, NO-PUBLISH / NO-DEPLOY** của tài liệu nguồn, phân biệt đầu ra đề xuất với năng lực đã được xác nhận. Các trang không có form tiếp nhận, chatbot, analytics, giá hoặc cam kết triển khai.

Các trang mới dùng HTML tĩnh, CSS chung tại `assets/service-detail.css`, tương tác tại `assets/service-detail.js` và ảnh riêng trong `src/assets/`. Giao diện có ảnh WebP đáp ứng theo màn hình, sơ đồ SVG, xem ảnh phóng to, menu đánh dấu mục đang đọc, thanh tiến trình, nút lên đầu trang và tab L1–L3 dùng được bằng bàn phím. Không cần bước build; nội dung vẫn đọc được khi JavaScript bị tắt. Hiệu ứng tôn trọng cài đặt giảm chuyển động.

Ảnh đầu trang là ảnh minh họa AI, được ghi nhãn trực tiếp. Mỗi trang mới lưu ảnh WebP và sơ đồ SVG trong `src/assets/`; ảnh không mô tả dự án thực tế của GASCOLAE.

**Phạm vi sử dụng hiện tại:** xem và review trên máy. Cần xác nhận quyền công bố của ba hồ sơ trước khi đưa bản cập nhật này lên hosting công khai. Thẻ `noindex` không thay thế kiểm soát truy cập.

## Chạy thử trên máy

Nếu máy đã cài Python, mở terminal tại thư mục dự án và chạy:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Sau đó mở `http://localhost:8080/`.

> Không mở trực tiếp bằng `file://`, vì HTTP server mô phỏng đúng cách website sẽ hoạt động sau khi host.

Kiểm tra dashboard, tìm kiếm/bộ lọc, liên kết tới 15 trang dịch vụ và hình ảnh trên trình duyệt. Trên các trang 13–15, kiểm tra thêm menu, tab L1–L3, FAQ và xem ảnh phóng to. Nhấn `Ctrl+C` trong terminal để dừng server.

## Deploy một link duy nhất sau khi nội dung được duyệt

### Cloudflare Pages

Upload **toàn bộ nội dung của thư mục này** làm static site. Không đặt build command; thư mục output là `.`.

### Netlify hoặc Vercel

Kết nối repository chứa thư mục này, chọn chế độ static/không framework, bỏ trống build command và đặt publish/output directory là `.`.

### GitHub Pages

Đưa toàn bộ nội dung đã được phép công bố lên một repository, sau đó bật Pages cho branch chứa website và chọn thư mục `/(root)` làm nguồn xuất bản. Giữ file `.nojekyll` ở thư mục gốc. Dashboard và 15 đường dẫn con sẽ được phục vụ cùng một domain.

## Lưu ý trước khi chạy production

- Các form và AI chat có sẵn trong 12 landing page ban đầu hiện chỉ mô phỏng phản hồi ở trình duyệt; chưa gửi dữ liệu tới backend.
- Dịch vụ 13–15 thuộc nhóm lọc “Quốc phòng & an ninh”; hiện là hồ sơ nghiên cứu nội bộ, chưa mở tiếp nhận yêu cầu.
- Một số trang dùng Google Fonts, Font Awesome hoặc Three.js qua CDN, nên cần kết nối internet để hiển thị đủ hiệu ứng.
- Khi có domain chính thức, nên cập nhật canonical URL và Open Graph URL theo domain đó.
