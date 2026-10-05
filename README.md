# GASCOLAE — Trung tâm 15 dịch vụ UAV

Thư mục này là một website tĩnh hoàn chỉnh, không cần cài package hoặc chạy bước build.

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

Ảnh đầu trang là ảnh minh họa AI, được ghi nhãn trực tiếp. Nguồn tạo, đường dẫn ảnh và prompt nằm trong [docs/service-illustrations.md](docs/service-illustrations.md). Đánh giá và thay đổi UI/UX được ghi tại [docs/ui-ux-review-13-15.md](docs/ui-ux-review-13-15.md).

**Phạm vi sử dụng hiện tại:** xem và review trên máy. Cần xác nhận quyền công bố của ba hồ sơ trước khi đưa bản cập nhật này lên hosting công khai. Thẻ `noindex` không thay thế kiểm soát truy cập.

## Chạy thử trên máy

Tại thư mục này, chạy:

```bash
node tools/serve.mjs
```

Hoặc, nếu máy chưa có Node.js:

```bash
python -m http.server 8080
```

Sau đó mở `http://localhost:8080/`.

> Không mở trực tiếp bằng `file://`, vì HTTP server mô phỏng đúng cách website sẽ hoạt động sau khi host.

Để tự kiểm tra dashboard, toàn bộ trang con, asset dùng chung và trang 404:

```bash
node tools/serve.mjs 8765 --verify
```

## Deploy một link duy nhất sau khi nội dung được duyệt

### Cloudflare Pages

Upload **toàn bộ nội dung của thư mục này** làm static site. Không đặt build command; thư mục output là `.`.

### Netlify hoặc Vercel

Kết nối repository chứa thư mục này, chọn chế độ static/không framework, bỏ trống build command và đặt publish/output directory là `.`.

### GitHub Pages

Đưa toàn bộ nội dung đã được phép công bố lên một repository, sau đó bật Pages cho branch chứa website. Dashboard và 15 đường dẫn con sẽ được phục vụ cùng một domain.

## Lưu ý trước khi chạy production

- Các form và AI chat có sẵn trong 12 landing page ban đầu hiện chỉ mô phỏng phản hồi ở trình duyệt; chưa gửi dữ liệu tới backend.
- Dịch vụ 13–15 thuộc nhóm lọc “Quốc phòng & an ninh”; hiện là hồ sơ nghiên cứu nội bộ, chưa mở tiếp nhận yêu cầu.
- Một số trang dùng Google Fonts, Font Awesome hoặc Three.js qua CDN, nên cần kết nối internet để hiển thị đủ hiệu ứng.
- Khi có domain chính thức, nên cập nhật canonical URL và Open Graph URL theo domain đó.
