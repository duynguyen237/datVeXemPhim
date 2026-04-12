<div align="center">

# 🎬 DatVeXemPhim - Modern Booking Experience

<img src="https://capsule-render.vercel.app/render?type=waving&color=00b4d8&height=250&section=header&text=DatVeXemPhim&fontSize=80&animation=fadeIn&fontAlignY=35" width="100%"/>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge&logo=statuspage" />
  <img src="https://img.shields.io/badge/Speed-Lightning-yellow?style=for-the-badge&logo=speedtest" />
</p>

**Hệ thống đặt vé xem phim thời gian thực - Nhanh chóng, mượt mà và bảo mật.**

[Xem Demo Live](https://your-link.com) • [Báo lỗi](https://github.com/user/repo/issues) • [Góp ý](https://github.com/user/repo/pulls)

</div>

---

## 🚀 Trải nghiệm người dùng (UX Animation)

Để tạo hiệu ứng chuyển động trong README, cách tốt nhất là chèn các đoạn GIF quay lại thao tác thực tế:

| 🪑 Chọn ghế Real-time | 🎟️ Thanh toán siêu tốc |
| :---: | :---: |
| <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Zic3V0N3M0bmE1bmE5bmE5bmE5bmE5bmE5bmE5bmE5bmE5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpx4WFdA3E08/giphy.gif" width="350"> | <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTVhNGI1Zjg3M2I0YTVhNGI1Zjg3M2I0YTVhNGI1Zjg3M2I0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV5KInVOKk/giphy.gif" width="350"> |
| *Ghế tự động khóa khi có người chọn (Socket.io)* | *Tích hợp VNPAY với phản hồi tức thì* |

---

## 🛠️ Công nghệ cốt lõi (Tech Stack)

Sử dụng các icons chuyển động nhẹ khi di chuột qua (tính năng của GitHub Markdown hỗ trợ hiển thị badge):

<p align="left">
  <a href="https://reactjs.org/" target="_blank"> 
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> 
  </a>
  <a href="https://nodejs.org" target="_blank"> 
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> 
  </a>
  <a href="https://www.mongodb.com/" target="_blank"> 
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" alt="mongodb" width="40" height="40"/> 
  </a>
  <a href="https://tailwindcss.com/" target="_blank"> 
    <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="tailwind" width="40" height="40"/> 
  </a>
  <a href="https://socket.io/" target="_blank"> 
    <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg" alt="socketio" width="40" height="40"/> 
  </a>
</p>

---

## 🗺️ Quy trình hệ thống (Animated Flow)

Dùng **Mermaid.js** để tạo sơ đồ trông rất kỹ thuật và chuyên nghiệp:

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant S as Socket Server
    participant DB as Database
    
    U->>S: Click chọn ghế A1
    S->>S: Khóa tạm thời ghế A1
    S-->>U: Hiển thị trạng thái "Đang giữ" (Màu vàng)
    U->>DB: Xác nhận thanh toán
    DB-->>S: Giao dịch thành công
    S-->>U: Cập nhật trạng thái "Đã bán" (Màu đỏ)
