// controllers/suatChieuController.js
const SuatChieuModel = require('../models/suatchieu'); 

const suatChieuController = {
    // Hàm này để hiện lịch chiếu ở trang Chi tiết phim/Đặt vé
    getSuatChieuByPhim: async (req, res) => {
        try {
            const maPhim = req.params.maPhim;
            // Gọi đúng hàm getByPhim trong file models/suatchieu.js
            const data = await SuatChieuModel.getByPhim(maPhim); 
            
            res.json({ 
                success: true, 
                data: data 
            });
        } catch (error) {
            console.error("Lỗi lấy lịch chiếu:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Hàm này để hiện thông tin ở Sidebar trang chọn ghế
    getThongTin: async (req, res) => {
        try {
            const id = req.params.id;
            const data = await SuatChieuModel.getDetailById(id);
            if (data) {
                res.json({ success: true, data: data });
            } else {
                res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = suatChieuController;