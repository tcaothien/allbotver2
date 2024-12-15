# allbotver2
# Discord Bot Project

Một bot Discord được xây dựng bằng Node.js với các tính năng quản lý tài chính, hôn nhân, và các lệnh quản trị viên. Bot này kết nối với MongoDB để lưu trữ dữ liệu người dùng và hoạt động 24/7 thông qua Render.com.

## Chức Năng Chính

### 1. **Tài Chính**
- **`e.xu`**: Kiểm tra số dư xu của người dùng.
- **`e.daily`**: Nhận quà tặng xu hàng ngày (1000 đến 20000 xu).
- **`e.givexu <số tiền> <@user>`**: Chuyển xu cho người khác.
- **`e.tx <tài|xỉu> <số điểm>`**: Đặt cược tài xỉu (tài hoặc xỉu, số điểm từ 3 đến 18).
- **`e.nohu <số xu>`**: Đặt cược tiền có thể trúng x100 số xu.
- **`e.top`**: Hiển thị bảng xếp hạng xu của server.

### 2. **Hôn Nhân**
- **`e.shop`**: Hiển thị cửa hàng nhẫn kết hôn.
- **`e.addemojishop <ID sản phẩm> <emoji>`**: Thêm emoji vào sản phẩm trong shop (admin).
- **`e.delimmojishop <ID sản phẩm>`**: Xóa emoji khỏi sản phẩm trong shop (admin).
- **`e.addspshop <ID> <tên sản phẩm> <giá>`**: Thêm sản phẩm vào shop (admin).
- **`e.delspshop <ID sản phẩm>`**: Xóa sản phẩm khỏi shop (admin).
- **`e.buy <ID sản phẩm>`**: Mua sản phẩm từ cửa hàng.
- **`e.inv`**: Kiểm tra kho vật phẩm của bạn.
- **`e.gift <@user> <ID sản phẩm>`**: Tặng sản phẩm cho người khác.
- **`e.marry <@user>`**: Cầu hôn người khác (cần nhẫn từ kho).
- **`e.divorce`**: Ly hôn với đối tác.
- **`e.pmarry`**: Xem thông tin hôn nhân của bạn.
- **`e.addimage <link hình ảnh>`**: Thêm ảnh vào thông tin hôn nhân.
- **`e.delimage`**: Xóa ảnh khỏi thông tin hôn nhân.
- **`e.addthumbnail <link thumbnail>`**: Thêm thumbnail vào thông tin hôn nhân.
- **`e.delthumbnail`**: Xóa thumbnail khỏi thông tin hôn nhân.
- **`e.addcaption <caption>`**: Thêm caption vào thông tin hôn nhân.
- **`e.delcaption`**: Xóa caption khỏi thông tin hôn nhân.

### 3. **Chức Năng Quản Trị Viên**
- **`e.addreply <câu trả lời>`**: Thêm câu trả lời tự động.
- **`e.delreply <câu trả lời>`**: Xóa câu trả lời tự động.
- **`e.listreply`**: Liệt kê các câu trả lời tự động.
- **`e.ban <@user>`**: Ban một thành viên.
- **`e.unban <@user>`**: Mở ban cho thành viên.
- **`e.mute <@user>`**: Mute một thành viên.
- **`e.unmute <@user>`**: Mở mute cho thành viên.
- **`e.kick <@user>`**: Kick một thành viên.
- **`e.lock`**: Khóa kênh chat.
- **`e.unlock`**: Mở khóa kênh chat.

### 4. **Chức Năng Dành Cho Admin Bot**
- **`e.addxu <số xu> <@user>`**: Thêm xu cho người dùng (admin bot).
- **`e.delxu <số xu> <@user>`**: Trừ xu từ người dùng (admin bot).
- **`e.prefix <mới>`**: Thay đổi prefix của bot.
- **`e.resetallbot`**: Reset tất cả dữ liệu của bot.

### 5. **Chức Năng Cho Tất Cả Thành Viên**
- **`e.sn`**: Xem lại 10 tin nhắn đã xóa gần nhất.
- **`e.av <@user>`**: Xem avatar của thành viên.
- **`e.rd <min> <max>`**: Random một số trong khoảng từ min đến max.
- **`e.pick <option1|option2|option3>`**: Chọn ngẫu nhiên trong các tùy chọn đưa ra.

## Cài Đặt

### 1. Cài Đặt Môi Trường
Đảm bảo rằng bạn đã cài đặt Node.js và MongoDB, sau đó cài đặt các gói cần thiết:

```bash
npm install
