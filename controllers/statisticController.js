// File: controllers/statisticController.js
const { connectDB } = require('../config/db'); // Nhúng file kết nối SQL Server của bạn

const getRevenueStatistics = async (req, res) => {
    try {
        // 1. Kết nối Database
        const pool = await connectDB();
        // =====================================================================
        // QUERY 1: LẤY TOP 5 PHIM DOANH THU CAO NHẤT VÀ SỐ VÉ (Cho Bảng & Biểu đồ tròn)
        // Dùng CTE (WITH) để tính riêng tiền và vé theo suất chiếu, tránh nhân đôi dữ liệu
        // =====================================================================
        const queryTopPhim = `
            WITH CTE_DoanhThu AS (
                SELECT MA_SUAT_CHIEU, SUM(TONG_TIEN_THANH_TOAN) AS DoanhThu
                FROM HOA_DON
                WHERE TRANG_THAI_THANH_TOAN = N'Thành công' 
                GROUP BY MA_SUAT_CHIEU
            ),
            CTE_SoVe AS (
                SELECT MA_SUAT_CHIEU, COUNT(MA_VE_XEM_PHIM) AS SoVe
                FROM VE_XEM_PHIM
                GROUP BY MA_SUAT_CHIEU
            )
            SELECT TOP 5 
                P.TEN_PHIM AS TenPhim,
                SUM(ISNULL(SV.SoVe, 0)) AS SoVe,
                SUM(ISNULL(DT.DoanhThu, 0)) AS DoanhThu
            FROM PHIM P
            INNER JOIN SUAT_CHIEU S ON P.MA_PHIM = S.MA_PHIM
            LEFT JOIN CTE_SoVe SV ON S.MA_SUAT_CHIEU = SV.MA_SUAT_CHIEU
            LEFT JOIN CTE_DoanhThu DT ON S.MA_SUAT_CHIEU = DT.MA_SUAT_CHIEU
            GROUP BY P.MA_PHIM, P.TEN_PHIM
            HAVING SUM(ISNULL(DT.DoanhThu, 0)) > 0
            ORDER BY DoanhThu DESC;
        `;
        const resultTopPhim = await pool.request().query(queryTopPhim);
        const topPhim = resultTopPhim.recordset;

        // Map dữ liệu để truyền riêng cho biểu đồ tròn (chỉ cần Tên và Doanh thu)
        const doanhThuPhim = topPhim.map(phim => ({
            TenPhim: phim.TenPhim,
            DoanhThu: phim.DoanhThu
        }));
        // =====================================================================
        // QUERY 2: LẤY DỮ LIỆU TỔNG QUAN (3 Thẻ màu trên cùng)
        // =====================================================================
        const queryTongQuan = `
            SELECT 
                (SELECT ISNULL(SUM(TONG_TIEN_THANH_TOAN), 0) FROM HOA_DON WHERE TRANG_THAI_THANH_TOAN = N'Thành công') AS TongDoanhThu,
                (SELECT COUNT(MA_VE_XEM_PHIM) FROM VE_XEM_PHIM) AS TongSoVe,
                (SELECT COUNT(DISTINCT MA_KHACH_HANG) FROM HOA_DON WHERE TRANG_THAI_THANH_TOAN = N'Thành công') AS TongKhachHang
        `;
        const resultTongQuan = await pool.request().query(queryTongQuan);
        const tongQuan = resultTongQuan.recordset[0];


        // =====================================================================
        // QUERY 3: LẤY DOANH THU THEO THÁNG TRONG NĂM NAY (Cho Biểu đồ cột)
        // =====================================================================
        const queryDoanhThuThang = `
            SELECT 
                MONTH(NGAY_LAP) AS Thang, 
                SUM(TONG_TIEN_THANH_TOAN) AS DoanhThu
            FROM HOA_DON
            WHERE YEAR(NGAY_LAP) = YEAR(GETDATE()) 
              AND TRANG_THAI_THANH_TOAN = N'Thành công'
            GROUP BY MONTH(NGAY_LAP)
            ORDER BY Thang;
        `;
        const resultDoanhThuThang = await pool.request().query(queryDoanhThuThang);
        const doanhThuThang = resultDoanhThuThang.recordset;


        // =====================================================================
        // RENDER GIAO DIỆN
        // Truyền toàn bộ số liệu thực tế ra file EJS
        // =====================================================================
        res.render('admin/thong-ke', {
            tongQuan: tongQuan,
            doanhThuThang: doanhThuThang,
            topPhim: topPhim,
            doanhThuPhim: doanhThuPhim
        });

    } catch (error) {
        console.error("Lỗi Controller Thống Kê:", error);
        res.status(500).send("Có lỗi xảy ra khi tải dữ liệu thống kê từ SQL Server.");
    }
};
module.exports = { getRevenueStatistics };