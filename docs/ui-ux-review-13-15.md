# Đánh giá UI/UX — Landing page 13, 14, 15

## Nhận xét và thay đổi

| Phạm vi | Vấn đề quan sát được | Cách sửa |
| --- | --- | --- |
| Trang 13 — S0075 | Sơ đồ ở đầu trang quá trừu tượng để nhận biết bối cảnh dịch vụ; nhiều thông tin nội bộ cạnh tranh với nội dung chính. | Thêm ảnh UAV trên địa hình núi; giữ tên và giới hạn 50–100 km ở vị trí dễ thấy; chuyển sơ đồ vào phần giải thích giải pháp. |
| Trang 14 — S0064 | Tiêu đề dài; nhiệt, OGI và khí tiếp xúc khó phân biệt khi đọc lướt. | Rút gọn tiêu đề, giữ đối tượng kho đạn và nhiên liệu ở dòng mô tả; thêm ảnh kho nhiên liệu, giải thích IR/OGI/LEL và sơ đồ tách hai nhóm thông tin. |
| Trang 15 — S0061 | Tiêu đề và phần mở đầu thiếu điểm nhấn trực quan; đường đi từ quan sát nhiệt đến đầu ra chưa rõ. | Viết tiêu đề trực tiếp hơn; thêm ảnh hạ tầng nguồn điện; sơ đồ quan sát nhiệt → tiêu chí được duyệt → kiểm tra bổ sung; làm rõ vai trò chuyên gia. |
| Cả ba trang | Sáu nhãn “Đề xuất · Cần xác minh” lặp lại trong mỗi trang, cùng số nội dung cần xác minh ở đầu trang, làm khó đọc lướt. | Bỏ nhãn lặp ở từng thẻ; giữ trạng thái chung, giới hạn từng phương pháp và số nội dung cần xác minh ở phần trạng thái hồ sơ. |
| Cả ba trang | Một số chữ phụ, nhãn sơ đồ và điều hướng cuối trang quá nhỏ. | Tăng cỡ chữ phụ và điều hướng; vẽ lại sơ đồ bằng các nhãn lớn, ngắn gọn; giải thích thuật ngữ bằng HTML có thể đọc và chọn được. |
| Cả ba trang | Trang dài nhưng menu thiếu mục ứng dụng/quy trình và chưa báo mục đang đọc. | Bổ sung liên kết, đánh dấu mục hiện tại, thanh tiến trình và nút lên đầu trang; menu thu gọn ở màn hình từ 1000px trở xuống. |
| Cả ba trang | Đóng menu sau khi chọn liên kết có thể làm mất vị trí focus trên bàn phím. | Đưa focus tới phần nội dung được chọn; Escape trả focus về nút menu. |
| Cả ba trang | Tab trên điện thoại xếp dọc trong khi phím điều khiển dùng trái/phải; FAQ có vùng bấm ngắn. | Giữ ba tab ngang, tên ngắn kèm mô tả; tăng vùng bấm FAQ tối thiểu 44px. |

## Hình ảnh và tương tác

- Ba ảnh mới do công cụ imagegen tích hợp tạo, có nhãn minh họa AI và chú thích ngay bên ảnh.
- Mỗi ảnh có hai kích thước WebP: 1536 × 1024 và 768 × 512. Bản nhỏ khoảng 58–105 KB; bản lớn khoảng 172–339 KB.
- Có cửa sổ xem ảnh đầy đủ, đóng bằng nút, Escape hoặc bấm ngoài; focus trở lại nút mở ảnh.
- Sơ đồ và ảnh trong cửa sổ xem được tải trễ; ảnh đầu trang được ưu tiên tải. Kích thước ảnh được khai báo để ổn định bố cục.
- Hiệu ứng rê chuột nhẹ, tôn trọng cài đặt giảm chuyển động. Không thêm hiệu ứng tự chạy hoặc thư viện bên ngoài.
- Ba ảnh thu nhỏ trên dashboard được cập nhật tương ứng.

## Kiểm tra

Đã kiểm tra bằng Chromium của Microsoft Edge trên máy:

- Cả ba trang ở 320, 375, 768, 1000, 1024 và 1440px: không tràn khung nội dung được kiểm tra.
- Menu mở/đóng, Escape, liên kết nội trang và focus sau điều hướng.
- Tab L1–L3: bấm, phím trái/phải và Home; FAQ mở/đóng.
- Ảnh, phóng to ảnh, đóng và khôi phục focus; đánh dấu mục đang đọc.
- Dashboard hiển thị đúng ba ảnh dịch vụ trong nhóm Quốc phòng & an ninh.
- Không thấy lỗi JavaScript hoặc yêu cầu tài nguyên thất bại trong các lượt kiểm tra.
- Khi tắt JavaScript, nội dung ba cấp và menu vẫn đọc được; nút phóng to không xuất hiện.

Đây là kiểm tra trên trình duyệt máy tính với các kích thước màn hình mô phỏng; chưa thử trên thiết bị iOS/Android thật.

## Trạng thái nội dung

Ba trang tiếp tục là hồ sơ nội bộ chờ phê duyệt theo tài liệu nguồn. Ảnh mới không được trình bày như ảnh dự án hoặc bằng chứng năng lực thực tế. Đợt sửa này không thêm biểu mẫu tiếp nhận, AI Agent, commit, push hay triển khai lên hosting.
