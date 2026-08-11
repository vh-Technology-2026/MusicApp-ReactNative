# 📋 Hướng Dẫn Cấu Hình Môi Trường Local (.env Guide)

Tài liệu này hướng dẫn cách thiết lập môi trường biến (Environment Variables) khi clone dự án Backend về máy cá nhân.

---

## 🔒 1. Quy tắc Bảo mật & Git

- **Thư mục `node_modules/`**: Không bao giờ được push lên Git repository. Khi clone code về, bạn chỉ cần chạy lệnh `npm install` để Node.js tự động tải lại toàn bộ thư viện cần thiết.
- **File `.env`**: Chứa các cấu hình riêng tư (như Port, Database URL, Secret Key,...). File này đã được thêm vào `.gitignore` nên sẽ **KHÔNG** bị push lên Git.

---

## ⚙️ 2. Các bước cài đặt khi Clone dự án về máy mới

### Bước 1: Tải các dependencies
Mở terminal tại thư mục gốc của Backend và chạy:
```bash
npm install
```

### Bước 2: Tạo file `.env` cá nhân
Tạo một file có tên chính xác là `.env` ngay tại thư mục gốc của dự án (`/Backend/.env`).

Sao chép hoặc điền các giá trị môi trường mẫu bên dưới vào file `.env`:

```env
# Cổng chạy của Express Backend Server
PORT=5000

# Môi trường chạy (development | production)
NODE_ENV=development
```

---

## 🚀 3. Khởi chạy Server

- **Chạy ở chế độ Development (tự động reload khi sửa code):**
  ```bash
  npm run dev
  ```

- **Chạy ở chế độ Production:**
  ```bash
  npm start
  ```

---

## 🏥 4. Kiểm tra Backend hoạt động

Sau khi chạy server, mở trình duyệt hoặc Postman/Insomnia kiểm tra:
- **Root URL**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Users API**: [http://localhost:5000/api/users](http://localhost:5000/api/users)
