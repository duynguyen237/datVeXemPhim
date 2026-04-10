const phimModel = require('../models/phim');
const suatChieuModel = require('../models/suatchieu');
const rapModel = require('../models/rap');
const phongModel = require('../models/phong');
const gheModel = require('../models/ghe');
const thongKeModel = require('../models/thongke');
const taiKhoanModel = require('../models/taikhoan');
const hoadonModel = require('../models/hoadon');
const axios = require('axios');

class AdminController {
    // ==========================================
    // 1. QUẢN LÝ PHIM
    // ==========================================
    async listPhim(req, res) {
        try {
            const phims = await phimModel.getAll();
            const theLoais = await phimModel.getAllTheLoai();
            res.render('admin/phim', { phims, theLoais });
        } catch (error) {
            console.error("Lỗi tải danh sách phim:", error.message);
            res.status(500).send("Lỗi server khi tải danh sách phim.");
        }
    }

    async addPhim(req, res) {
        try {
            const { ten, trailer, noidung, tuoi, thoiluong, daodien, dienvien, poster, nen, maTL } = req.body;
            await phimModel.create({ ten, trailer, noidung, tuoi, thoiluong, daodien, dienvien, poster, nen, maTL });
            res.redirect('/admin/phim');
        } catch (error) {
            console.error("Lỗi SQL khi thêm phim:", error.message);
            res.status(500).send("Lỗi SQL: " + error.message);
        }
    }

    async deletePhim(req, res) {
        try {
            const id = req.params.id;
            await phimModel.delete(id);
            res.json({ success: true });
        } catch (error) {
            console.error("Lỗi xóa phim:", error.message);
            res.status(500).json({ success: false, message: "Không thể xóa phim này vì đã có suất chiếu!" });
        }
    }

    // ==========================================
    // 2. QUẢN LÝ SUẤT CHIẾU
    // ==========================================
    async listSuatChieu(req, res) {
        try {
            // Lấy song song dữ liệu để tăng tốc độ load trang
            const [suatChieus, phims, raps, phongs] = await Promise.all([
                suatChieuModel.getAllAdmin(),
                phimModel.getAll(),
                rapModel.getAll(),
                phongModel.getAll()
            ]);

            res.render('admin/suatchieu', { suatChieus, phims, raps, phongs });
        } catch (error) {
            console.error("Lỗi tải danh sách suất chiếu:", error.message);
            res.status(500).send("Lỗi tải danh sách suất chiếu. Vui lòng kiểm tra lại Models.");
        }
    }

    async addSuatChieu(req, res) {
        try {
            const { maPhim, maRap, maPhong, ngay, gio, gia } = req.body;
            await suatChieuModel.create({ maPhim, maRap, maPhong, ngay, gio, gia });
            res.redirect('/admin/suat-chieu');
        } catch (error) {
            console.error("Lỗi thêm suất chiếu:", error.message);
            res.status(500).send("Lỗi thêm suất chiếu: " + error.message);
        }
    }

    // Thêm vào AdminController
    async getPhongsByRap(req, res) {
        try {
            const maRap = req.params.maRap;
            // Gọi hàm từ phongModel để lấy phòng của rạp cụ thể
            const phongs = await phongModel.getByRap(maRap);
            res.json({ success: true, data: phongs });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }

    // ==========================================
    // 3. QUẢN LÝ PHÒNG & TỰ ĐỘNG TẠO GHẾ
    // ==========================================

    // Hiển thị giao diện danh sách phòng chiếu
    // adminController.js

    // adminController.js

    async listPhong(req, res) {
        try {
            // Chạy song song 2 query:
            // 1. Lấy danh sách phòng (kèm COUNT ghế và JOIN rạp theo SQL mới của bạn)
            // 2. Lấy danh sách rạp để hiển thị trong <select> khi thêm phòng
            const [phongs, raps] = await Promise.all([
                phongModel.getAll(), // Hàm này sử dụng câu lệnh SELECT bạn vừa gửi
                rapModel.getAll()    // Đảm bảo rapModel lấy từ bảng THONG_TIN_RAP
            ]);

            res.render('admin/phong', {
                phongs: phongs,
                raps: raps
            });
        } catch (error) {
            console.error("Lỗi tải trang quản lý phòng:", error.message);
            res.status(500).send("Lỗi server.");
        }
    }

    async addPhongVaGhe(req, res) {
        try {
            const { tenPhong, soHang, soCot, maRap } = req.body;

            // 1. Tạo phòng mới gắn với mã rạp thực tế
            const result = await phongModel.create({
                ten: tenPhong,
                maRap: parseInt(maRap),
                soHang: parseInt(soHang),
                soCot: parseInt(soCot)
            });

            // Lấy mã phòng vừa tạo (tùy thuộc vào Database có trả về recordset hay không)
            const maPhongMoi = result.recordset[0].MA_PHONG_CHIEU;

            // 2. Tự động sinh sơ đồ ghế vào bảng GHE_NGOI
            const chuCai = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (let i = 0; i < soHang; i++) {
                for (let j = 1; j <= soCot; j++) {
                    const tenGhe = chuCai[i] + j;
                    const giaGhe = (i < 3) ? 20000 : 0;
                    // Đảm bảo gheModel.insertGhe đã đổi tên bảng thành GHE_NGOI
                    await gheModel.insertGhe({ maPhong: maPhongMoi, tenGhe, gia: giaGhe });
                }
            }

            res.json({ success: true, message: "Tạo phòng và sinh ghế thành công!" });
        } catch (error) {
            console.error("Lỗi:", error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getSoDoGhe(req, res) {
        try {
            const maPhong = req.params.id;
            const gheList = await gheModel.getGheByPhong(maPhong);

            res.json({ success: true, data: gheList });
        } catch (error) {
            console.error("Lỗi lấy sơ đồ ghế:", error.message);
            res.status(500).json({ success: false, message: "Lỗi server khi lấy sơ đồ ghế" });
        }
    }

    // ==========================================
    // 4. QUẢN LÝ THỐNG KÊ (DASHBOARD)
    // ==========================================
    async getDashboard(req, res) {
        try {
            const tongQuan = await thongKeModel.getTongQuan();
            const doanhThuThang = await thongKeModel.getDoanhThuTheoThang();

            res.render('admin/doanhthu', {
                tongQuan: tongQuan,
                doanhThuThang: JSON.stringify(doanhThuThang) // Chuyển sang chuỗi để thẻ <script> vẽ biểu đồ dễ đọc
            });
        } catch (error) {
            console.error("Lỗi lấy dữ liệu thống kê:", error.message);
            res.status(500).send("Lỗi server khi tải trang thống kê.");
        }
    }

    // ==========================================
    // 5. QUẢN LÝ KHÁCH HÀNG (USERS)
    // ==========================================
    async listUsers(req, res) {
        try {
            const users = await taiKhoanModel.getAll();
            res.render('admin/users', { users: users });
        } catch (error) {
            console.error("Lỗi tải danh sách người dùng:", error.message);
            res.status(500).send("Lỗi tải danh sách người dùng.");
        }
    }

    // ==========================================
    // 6. QUẢN LÝ HÓA ĐƠN
    // ==========================================
    async listHoaDon(req, res) {
        try {
            const hoaDons = await hoadonModel.getAllAdmin();
            res.render('admin/hoadon', { hoaDons });
        } catch (error) {
            console.error("Lỗi tải danh sách hóa đơn:", error.message);
            res.status(500).send("Lỗi tải danh sách hóa đơn.");
        }
    }

    // ==========================================
    // 7. TOOL TỰ ĐỘNG THÊM PHIM TỪ TMDB
    // ==========================================
    async autoImportPhim(req, res) {
        try {
            // API Key của TMDB
            const TMDB_API_KEY = 'c5c4c0f86e55674f9cc50132717dcc75';

            // 1. Gọi API lấy 20 phim đang chiếu (Ngôn ngữ: Tiếng Việt)
            const response = await axios.get(`https://api.themoviedb.org/3/movie/now_playing`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'vi-VN',
                    page: 1,
                    region: 'VN'
                }
            });

            const danhSachPhim = response.data.results;
            let soPhimDaThem = 0;

            // 2. Lặp qua từng phim và lưu vào Database
            for (const phim of danhSachPhim) {
                const thongTinPhim = {
                    ten: phim.title,
                    trailer: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    noidung: phim.overview || "Đang cập nhật nội dung...",
                    tuoi: 16,
                    thoiluong: Math.floor(Math.random() * (150 - 90 + 1)) + 90,
                    daodien: "Đang cập nhật",
                    dienvien: "Đang cập nhật",
                    poster: `https://image.tmdb.org/t/p/w500${phim.poster_path}`,
                    nen: `https://image.tmdb.org/t/p/original${phim.backdrop_path}`,
                    maTL: 1
                };

                await phimModel.create(thongTinPhim);
                soPhimDaThem++;
            }

            // Trả về HTML thông báo thành công
            res.send(`
                <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h2 style="color: #28a745;">Thành công rực rỡ!</h2>
                    <p>Đã cào và thêm <strong>${soPhimDaThem}</strong> bộ phim vào Database.</p>
                    <br>
                    <a href="/admin/phim" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Quay lại trang quản lý phim</a>
                </div>
            `);

        } catch (error) {
            console.error("Lỗi khi cào phim từ TMDB:", error.message);
            res.status(500).send("Có lỗi xảy ra khi kéo phim: " + error.message);
        }
    }
}

module.exports = new AdminController();