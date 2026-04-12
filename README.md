# 🎬 DatVeXemPhim - Hệ Thống Đặt Vé Trực Tuyến Thế Hệ Mới

<p align="center">
  <img src="https://capsule-render.vercel.app/render?type=waving&color=auto&height=250&section=header&text=DatVeXemPhim%20🎬&fontSize=70" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

---

## 📍 Mục lục
1. [🚀 Giới thiệu](#-giới-thiệu)
2. [✨ Tính năng nổi bật](#-tính-năng-nổi-bật)
3. [📸 Giao diện ứng dụng](#-giao- diện-ứng-dụng)
4. [🛠️ Tech Stack](#️-tech-stack)
5. [⚙️ Cài đặt](#️-cài-đặt)
6. [🗺️ Luồng hoạt động](#️-luồng-hoạt-động)
7. [📈 Lộ trình phát triển](#-lộ-trình-phát-triển)

---

## 🚀 Giới thiệu
**DatVeXemPhim** giải quyết bài toán đặt vé truyền thống bằng cách cung cấp trải nghiệm **Real-time Seat Selection** (Chọn ghế thời gian thực). Người dùng không còn lo lắng về việc bị trùng ghế hay hệ thống phản hồi chậm.

> **Key Highlight:** Tích hợp Socket.io để cập nhật trạng thái ghế ngay lập tức khi có người khác đang chọn.

---

## ✨ Tính năng nổi bật

- 🔐 **Authentication:** Đăng nhập JWT, bảo mật 2 lớp cơ bản.
- 🎟️ **Real-time Booking:** Chọn ghế và giữ chỗ trong 5 phút.
- 💳 **Payment:** Tích hợp cổng thanh toán VNPAY/Momo Sandbox.
- 📱 **Mobile First:** Giao diện tối ưu hoàn hảo cho mọi thiết bị.
- 📧 **Auto Mail:** Gửi vé kèm mã QR qua Email sau khi thanh toán thành công.

---

## 📸 Giao diện ứng dụng

<details>
  <summary>🔍 Nhấn để xem ảnh màn hình dự án</summary>
  
  ### Desktop View
  | Trang chủ | Trang chọn ghế |
  | :---: | :---: |
  | <img src="https://via.placeholder.com/800x450?text=Home+Page+Desktop" width="400"> | <img src="https://via.placeholder.com/800x450?text=Seat+Selection+Desktop" width="400"> |

  ### Mobile View
  <p align="center">
    <img src="https://via.placeholder.com/300x600?text=Mobile+UI+1" width="200">
    <img src="https://via.placeholder.com/300x600?text=Mobile+UI+2" width="200">
  </p>
</details>

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion (hiệu ứng mượt).
- **Backend:** Node.js, Express, Socket.io.
- **Database:** MongoDB (Mongoose).
- **Tools:** Postman, Docker, Git.

---

## 🗺️ Luồng hoạt động (User Flow)

```mermaid
graph LR
    A[Duyệt phim] --> B[Xem chi tiết/Trailer]
    B --> C[Chọn Suất & Rạp]
    C --> D{Chọn ghế}
    D -- Đang chọn --> E[Socket.io khóa ghế tạm thời]
    E --> F[Thanh toán Online]
    F -- Thành công --> G[Nhận vé & QR Code]
    F -- Thất bại --> D
