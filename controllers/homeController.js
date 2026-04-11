const phimModel = require('../models/phim');
const danhGiaModel = require('../models/danhgia');
const rapModel = require('../models/rap');

class HomeController {
    // 1. TRANG CHỦ (Hiển thị phim và 3 review mới nhất)
    async getHomePage(req, res) {
        try {
            // Lấy dữ liệu song song để web load nhanh hơn
            const [movies, recentReviews] = await Promise.all([
                phimModel.getAll(),
                danhGiaModel.getRecentReviews(3) // Lấy 3 đánh giá mới nhất cho trang chủ
            ]);

            // Cắt lấy 10 phim đầu tiên để đưa lên mục "Phim Đang Chiếu"
            const heroMovies = movies.slice(0, 10);

            res.render('index', {
                heroMovies: heroMovies,
                recentReviews: recentReviews
            });
        } catch (error) {
            console.error("Lỗi tải trang chủ:", error);
            res.status(500).send("Lỗi server khi tải trang chủ.");
        }
    }

    // 2. TRANG HỆ THỐNG RẠP (Hiển thị toàn bộ rạp chiếu)
    async getRapChieuPage(req, res) {
        try {
            const raps = await rapModel.getAll();
            res.render('rapchieu', { raps: raps });
        } catch (error) {
            console.error("Lỗi tải trang rạp chiếu:", error);
            res.status(500).send("Lỗi máy chủ khi tải danh sách rạp.");
        }
    }

    // 3. TRANG REVIEW PHIM (Hiển thị nhiều đánh giá hơn)
    async getReviewPage(req, res) {
        try {
            const reviews = await danhGiaModel.getRecentReviews(20);
            let phimDaXem = [];

            // Lấy thông tin user đăng nhập (Tùy thuộc bạn lưu user vào session hay locals)
            // Giả sử bạn đang dùng req.session.user
            const user = req.session ? req.session.user : res.locals.user;

            if (user && user.MA_NGUOI_DUNG) {
                // Nếu đã đăng nhập, truy vấn các phim người này đã mua vé
                phimDaXem = await phimModel.getPhimDaXem(user.MA_NGUOI_DUNG);
            }

            res.render('review', {
                reviews: reviews,
                phimDaXem: phimDaXem,
                user: user // Truyền user sang để EJS biết trạng thái đăng nhập
            });
        } catch (error) {
            console.error("Lỗi tải trang review:", error);
            res.status(500).send("Lỗi máy chủ khi tải trang đánh giá.");
        }
    }

    // 2. THÊM HÀM NÀY: Xử lý khi khách bấm gửi form đánh giá
    // Trong controllers/homeController.js
    async submitReview(req, res) {
        try {
            // Lấy maNguoiDung từ input ẩn trong Form thay vì lấy từ session
            const { maPhim, maNguoiDung, noiDung } = req.body;

            if (!maNguoiDung) return res.status(401).send("Vui lòng đăng nhập!");

            await danhGiaModel.create(maPhim, maNguoiDung, noiDung);
            res.redirect('/review-phim');
        } catch (error) {
            console.error("Lỗi lưu đánh giá:", error);
            res.status(500).send("Lỗi khi gửi đánh giá.");
        }
    }
}

module.exports = new HomeController();