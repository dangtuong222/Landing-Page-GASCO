# GASCOLAE — Trung tâm 12 dịch vụ UAV

Thư mục này là một website tĩnh hoàn chỉnh, không cần cài package hoặc chạy bước build.

## Cấu trúc URL

- `/` — dashboard tổng, có tìm kiếm và bộ lọc dịch vụ
- `/landing_page_01/` đến `/landing_page_12/` — 12 landing page độc lập
- Mỗi landing page có thanh nổi để quay về dashboard hoặc chuyển sang dịch vụ tiếp theo

Các đường dẫn đều là đường dẫn tương đối, nên website chạy được cả ở domain riêng và ở subpath như GitHub Pages.

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

Để tự kiểm tra dashboard, 12 trang con, asset dùng chung và trang 404:

```bash
node tools/serve.mjs 8765 --verify
```

## Deploy một link duy nhất

### Cloudflare Pages

Upload **toàn bộ nội dung của thư mục này** làm static site. Không đặt build command; thư mục output là `.`.

### Netlify hoặc Vercel

Kết nối repository chứa thư mục này, chọn chế độ static/không framework, bỏ trống build command và đặt publish/output directory là `.`.

### GitHub Pages

Đưa toàn bộ nội dung lên một repository, sau đó bật Pages cho branch chứa website. Dashboard và 12 đường dẫn con sẽ được phục vụ cùng một domain.

## Lưu ý trước khi chạy production

- Các form và AI chat có sẵn trong 12 landing page hiện chỉ mô phỏng phản hồi ở trình duyệt; chưa gửi dữ liệu tới backend.
- Một số trang dùng Google Fonts, Font Awesome hoặc Three.js qua CDN, nên cần kết nối internet để hiển thị đủ hiệu ứng.
- Khi có domain chính thức, nên cập nhật canonical URL và Open Graph URL theo domain đó.
