# 🚀 HƯỚNG DẪN SỬ DỤNG - HỆ THỐNG CRM BIC HÀ NỘI

## 📋 MỤC LỤC

1. [Cài đặt &amp; Khởi động](#1-cài-đặt--khởi-động)
2. [Tài khoản đăng nhập](#2-tài-khoản-đăng-nhập)
3. [Hướng dẫn Test theo Flow](#3-hướng-dẫn-test-theo-flow)
4. [Tính năng theo Role](#4-tính-năng-theo-role)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. CÀI ĐẶT & KHỞI ĐỘNG

### Bước 1: Cài đặt Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 2: Cấu hình Database

**Tạo file `.env` trong thư mục `backend`:**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_bic
JWT_SECRET=your_super_secret_key_min_32_characters_long_here
PORT=5000
NODE_ENV=development
```

### Bước 3: Khởi tạo Database

**Chọn 1 trong 2 cách:**

#### Cách 1: Setup tự động (Database trống + 3 tài khoản)

```bash
cd backend
node setup-database.js
```

**Kết quả:**

- ✅ Tạo database `crm_bic` với đầy đủ schema
- ✅ 3 tài khoản: `admin`, `nhanvien1`, `quanly1`
- ✅ Tất cả password: **123456**

#### Cách 2: Import Seed Data (Database + 5 nhân viên + 8 khách hàng + data test)

```bash
mysql -u root -p crm_bic < backend/seed.sql
```

**Kết quả:**

- ✅ Database với 5 nhân viên, 8 khách hàng, 12 lịch hẹn
- ✅ 5 tài khoản: `admin`, `manager1`, `nhanvien1`, `nhanvien2`, `nhanvien3`
- ✅ Tất cả password: **123456**

### Bước 4: Khởi động Backend

```bash
cd backend
npm run dev
```

**Terminal sẽ hiển thị:**

```
🚀 Server running on port 5000
✅ MySQL Connected
⏰ Cron job: Contract renewal check scheduled at 6:00 AM daily
```

### Bước 5: Khởi động Frontend

```bash
cd ../frontend
npm run dev
```

**Mở trình duyệt:** `http://localhost:3000`

---

## 2. TÀI KHOẢN ĐĂNG NHẬP

### 🔐 **TẤT CẢ DÙNG PASSWORD: `123456`**

| Username            | Password | Role            | Mô tả                                                |
| ------------------- | -------- | --------------- | ------------------------------------------------------ |
| **admin**     | 123456   | Ban giám đốc | Xem tất cả báo cáo, quản lý toàn bộ hệ thống |
| **manager1**  | 123456   | Quản lý       | Duyệt hồ sơ, quản lý nhân viên, xem báo cáo   |
| **quanly1**   | 123456   | Quản lý       | (Nếu dùng setup-database.js)                         |
| **nhanvien1** | 123456   | Nhân viên     | Lê Minh Cường - Có 3 KH, 3 cơ hội                |
| **nhanvien2** | 123456   | Nhân viên     | Phạm Thu Dung - Có 3 KH, 3 cơ hội                  |
| **nhanvien3** | 123456   | Nhân viên     | Hoàng Văn Em - Có 2 KH, 2 cơ hội                  |

### ⚠️ **LƯU Ý BẢO MẬT**

- Password mặc định `123456` chỉ dùng cho môi trường TEST
- Sau khi đăng nhập, vào **Profile** → **Đổi mật khẩu**
- Trong production: Đặt password mạnh (>8 ký tự, chữ + số + ký tự đặc biệt)

---

## 3. HƯỚNG DẪN TEST THEO FLOW

### 🎯 FLOW 1: HAPPY PATH - THÀNH CÔNG TOÀN BỘ (27 bước)

**Mục tiêu:** Test luồng lý tưởng từ KH tiềm năng → Ký HĐ thành công

#### **Bước 1-4: Tạo Khách hàng & Cơ hội**

1. **Đăng nhập:** `nhanvien1` / `123456`
2. **Vào "Khách hàng"** → Click **"Thêm mới"**

   ```
   Tên: Nguyễn Văn Test
   Loại: Cá nhân
   SĐT: 0987654321
   Email: test@gmail.com
   Địa chỉ: Hà Nội
   ```

   ✅ **Kiểm tra:** Trạng thái tự động = **"Tiềm năng"**
3. **Vào "Cơ hội"** → Click **"Tạo cơ hội"**

   ```
   Khách hàng: Nguyễn Văn Test
   Tên cơ hội: Bảo hiểm sức khỏe 2025
   Giá trị: 20,000,000 VNĐ
   ```

   ✅ **Kiểm tra:**

   - Cơ hội: Trạng thái = **"Mới"**
   - KH: Trạng thái chuyển thành **"Đang chăm sóc"**

#### **Bước 5-11: Tạo Lịch hẹn & Hoàn thành**

4. **Vào "Lịch hẹn"** → Click **"Tạo lịch hẹn"**

   ```
   Cơ hội: Bảo hiểm sức khỏe 2025
   Thời gian: [Chọn ngày mai, 14:00]
   Địa điểm: Văn phòng BIC Láng Hạ
   Nội dung: Tư vấn sản phẩm
   ```

   ✅ **Kiểm tra:**

   - Lịch hẹn: Trạng thái = **"Sắp diễn ra"**
   - Cơ hội: Trạng thái chuyển thành **"Chờ xử lý"**
   - 🔔 Thông báo realtime hiện lên
5. **Hoàn thành lịch hẹn:**

   - Click vào lịch hẹn vừa tạo
   - Click **"Hoàn thành"**
   - Chọn: ✅ **Thành công**
   - Kết quả: "KH đồng ý mua, cần bổ sung hồ sơ"

   ✅ **Kiểm tra:** Trạng thái = **"Hoàn thành"**

#### **Bước 17-25: Upload & Duyệt Hồ sơ**

6. **Vào "Hồ sơ"** → Click **"Upload hồ sơ"**

   ```
   Cơ hội: Bảo hiểm sức khỏe 2025
   Tên hồ sơ: Hồ sơ sức khỏe - Nguyễn Văn Test
   File: [Chọn file PDF bất kỳ]
   ```

   ✅ **Kiểm tra:** Trạng thái = **"Chờ duyệt"**
7. **Đăng xuất** → **Đăng nhập:** `manager1` / `123456`
8. **Vào "Quản lý"** → **"Hồ sơ chờ duyệt"**

   - Tìm hồ sơ "Hồ sơ sức khỏe - Nguyễn Văn Test"
   - Click **"Duyệt"**

   ✅ **Kiểm tra:**

   - Trạng thái = **"Đã duyệt"**
   - Ngày duyệt được ghi nhận
   - 🔔 nhanvien1 nhận thông báo "Hồ sơ đã được duyệt"

#### **Bước 26-27: Tạo Hợp đồng**

9. **Đăng xuất** → **Đăng nhập:** `nhanvien1` / `123456`
10. **Vào "Hợp đồng"** → Click **"Tạo hợp đồng"**

    ```
    Hồ sơ: Hồ sơ sức khỏe - Nguyễn Văn Test
    Mã HĐ: BIC-HN-2025-TEST001
    Ngày hiệu lực: 01/12/2024
    Ngày hết hạn: 01/12/2025
    Giá trị: 20,000,000 VNĐ
    File: [Chọn file PDF hợp đồng]
    ```

    ✅ **Kiểm tra:**

    - Hợp đồng được tạo thành công
    - Cơ hội: Trạng thái = **"Thành công"**
    - KH: Trạng thái = **"Thành công"**

#### **Kiểm tra Báo cáo**

11. **Đăng nhập:** `admin` / `123456`
12. **Vào "Báo cáo"**
    ✅ **Kiểm tra:**

    - Top nhân viên: Lê Minh Cường có doanh thu +20M
    - KPI tháng này: Cơ hội thành công +1
    - Biểu đồ doanh thu tháng 12/2024 tăng

---

### 🔴 FLOW 2: HỦY LỊCH HẸN (Test Churn Logic)

1. **Tạo KH mới** → **Tạo Cơ hội** → **Tạo Lịch hẹn**
2. **Hủy lịch hẹn:**

   - Click vào lịch hẹn
   - Click **"Hủy"**
   - Lý do: "KH bận, xin dời lịch"

   ✅ **Kiểm tra:**

   - Lịch hẹn: Trạng thái = **"Hủy"**
   - Cơ hội: Trạng thái = **"Thất bại"**

---

### 🟠 FLOW 3: TEST CHURN PREDICTION - "RỜI BỎ"

**Điều kiện:** KH đã từng mua (có HĐ cũ đã hết hạn)

1. **Chọn KH:** `Lê Thị Mai` (ID=4) - Đã có HĐ BIC-HN-2024-002 sẽ hết hạn 19/02/2025
2. **Tạo Cơ hội mới:**

   ```
   Tên: Tái tục bảo hiểm ung thư
   Giá trị: 35,000,000 VNĐ
   ```
3. **Tạo Lịch hẹn** → **Hoàn thành với kết quả THẤT BẠI**

   ```
   Kết quả: KH không quan tâm tái tục
   Chọn: ❌ Thất bại
   ```
4. **✅ Kiểm tra Churn Prediction Logic:**

   - Vào "Khách hàng" → Lọc "Rời bỏ"
   - Lê Thị Mai tự động chuyển thành **"Rời bỏ"**

   **Logic:**

   - ✅ KH có HĐ cũ? → YES
   - ✅ Tất cả HĐ đã hết hạn? → YES
   - ✅ AUTO: TrangThai = "Rời bỏ"

---

### 🟡 FLOW 4: TEST CHURN PREDICTION - "KHÔNG TIỀM NĂNG"

**Điều kiện:** KH chưa từng mua (không có HĐ nào)

1. **Tạo KH mới:**

   ```
   Tên: Trần Thị Chưa Mua
   Loại: Cá nhân
   ```
2. **Tạo Cơ hội** → **Tạo Lịch hẹn** → **Hoàn thành THẤT BẠI**

   ```
   Kết quả: KH không quan tâm
   Chọn: ❌ Thất bại
   ```
3. **✅ Kiểm tra Churn Prediction Logic:**

   - KH tự động chuyển thành **"Không tiềm năng"**

   **Logic:**

   - ✅ KH có HĐ nào? → NO
   - ✅ Còn Cơ hội 'Mới'/'Chờ xử lý'? → NO
   - ✅ AUTO: TrangThai = "Không tiềm năng"

---

### 🔵 FLOW 5: TỪ CHỐI HỒ SƠ

1. **nhanvien1:** Upload hồ sơ
2. **manager1:** Vào "Hồ sơ chờ duyệt" → Click **"Từ chối"**

   ```
   Lý do: Thiếu giấy CMND, cần bổ sung
   ```

   ✅ **Kiểm tra:** Trạng thái = **"Bổ sung"**
3. **nhanvien1:** Vào "Hồ sơ" → Thấy hồ sơ status "Bổ sung" → **Re-upload**
4. **manager1:** Duyệt lại → ✅ Thành công

---

### 🟣 FLOW 6: TEST CRON JOB TÁI TỤC

1. **Update HĐ để test:**

   ```sql
   UPDATE HopDong 
   SET NgayHetHan = DATE_ADD(CURDATE(), INTERVAL 15 DAY)
   WHERE ID = 2;
   ```
2. **Chờ 6:00 AM hoặc trigger thủ công** (Xem file `server.js`, uncomment cron job)
3. **✅ Kiểm tra:**

   - nhanvien2 nhận thông báo: "Hợp đồng BIC-HN-2024-002 sẽ hết hạn..."
   - Badge đỏ ở icon chuông
   - Dữ liệu trong bảng `ThongBao`

---

## 4. TÍNH NĂNG THEO ROLE

### 👤 NHÂN VIÊN (nhanvien1, nhanvien2, nhanvien3)

**Được phép:**

- ✅ Tạo/Sửa/Xóa KH của mình
- ✅ Tạo Cơ hội cho KH của mình
- ✅ Tạo Lịch hẹn
- ✅ Upload Hồ sơ
- ✅ Tạo Hợp đồng (nếu hồ sơ đã duyệt)
- ✅ Xem KPI của bản thân
- ✅ Xem Thông báo của mình

**Không được phép:**

- ❌ Xem/Sửa KH của nhân viên khác
- ❌ Duyệt hồ sơ
- ❌ Tạo tài khoản nhân viên
- ❌ Xem báo cáo tổng hợp

---

### 👨‍💼 QUẢN LÝ (manager1, quanly1)

**Được phép:**

- ✅ Tất cả quyền của Nhân viên
- ✅ Xem/Sửa KH của TẤT CẢ nhân viên
- ✅ **Duyệt/Từ chối Hồ sơ**
- ✅ Tạo tài khoản nhân viên mới
- ✅ Xem báo cáo tổng hợp
- ✅ Xem KPI tất cả nhân viên

**Không được phép:**

- ❌ Xóa tài khoản (chỉ khóa được)

---

### 👔 BAN GIÁM ĐỐC (admin)

**Toàn quyền:**

- ✅ Tất cả quyền của Quản lý
- ✅ Xem Dashboard tổng quan
- ✅ Export báo cáo Excel/PDF
- ✅ Quản lý Role & Phân quyền
- ✅ Xem logs hệ thống

---

## 5. TROUBLESHOOTING

### ❌ Lỗi: "Cannot connect to MySQL"

**Nguyên nhân:** MySQL chưa chạy hoặc sai thông tin trong `.env`

**Giải pháp:**

1. Kiểm tra MySQL đang chạy:

   ```bash
   # Windows
   net start MySQL80

   # macOS/Linux
   sudo service mysql start
   ```
2. Kiểm tra thông tin `.env`:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password
   ```

---

### ❌ Lỗi: "Invalid credentials" khi login

**Nguyên nhân:** Password bị sai hoặc database chưa setup đúng

**Giải pháp:**

1. **Xác nhận password:** Tất cả đều là `123456`
2. **Re-setup database:**

   ```bash
   cd backend
   node setup-database.js
   ```
3. **Hoặc import seed:**

   ```bash
   mysql -u root -p crm_bic < backend/seed.sql
   ```

---

### ❌ Lỗi: "File upload failed"

**Nguyên nhân:** Thư mục `uploads/` chưa tồn tại

**Giải pháp:**

```bash
cd backend
mkdir uploads
mkdir uploads/hoso
mkdir uploads/hopdong
```

---

### ❌ Lỗi: "Port 5000 already in use"

**Giải pháp:**

1. Tìm process đang dùng port 5000:

   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -i :5000
   kill -9 <PID>
   ```
2. Hoặc đổi port trong `.env`:

   ```env
   PORT=5001
   ```

---

### ❌ Thông báo không hiện realtime

**Nguyên nhân:** Socket.IO chưa kết nối

**Giải pháp:**

1. Mở DevTools Console → Kiểm tra:

   ```
   Socket connected: true
   ```
2. Kiểm tra backend log:

   ```
   ⚡ Socket user connected: userId=3
   ```
3. Hard refresh trình duyệt: `Ctrl + Shift + R`

---

## 📞 HỖ TRỢ

**Nếu gặp lỗi khác:**

1. Kiểm tra log trong terminal (backend & frontend)
2. Mở DevTools → Console/Network tab
3. Kiểm tra database bằng MySQL Workbench

**Password mặc định cho tất cả tài khoản: `123456`**

---

**Chúc test vui vẻ! 🚀**
