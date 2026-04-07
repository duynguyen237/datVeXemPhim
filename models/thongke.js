const { poolPromise, sql } = require('../config/db');

class ThongKeModel {
    // Lấy doanh thu theo từng tháng trong năm hiện tại
    async getDoanhThuTheoThang() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                MONTH(NGAY_DAT_VE) as Thang,
                SUM(TONG_TIEN_THANH_TOAN) as DoanhThu,
                COUNT(MA_HOA_DON) as SoDonHang
            FROM HOA_DON
            WHERE TRANG_THAI_THANH_TOAN = N'Đã thanh toán' AND YEAR(NGAY_DAT_VE) = YEAR(GETDATE())
            GROUP BY MONTH(NGAY_DAT_VE)
            ORDER BY Thang
        `);
        return result.recordset;
    }
    // Lấy tổng quan (Tổng doanh thu, Tổng vé bán ra)
    async getTongQuan() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                (SELECT ISNULL(SUM(TONG_TIEN_THANH_TOAN), 0) FROM HOA_DON WHERE TRANG_THAI_THANH_TOAN = N'Đã thanh toán') as TongDoanhThu,
                (SELECT COUNT(*) FROM VE_XEM_PHIM) as TongSoVe,
                (SELECT COUNT(*) FROM NGUOI_DUNG WHERE MA_VAI_TRO = 2) as TongKhachHang
        `);
        return result.recordset[0];
    }
}
module.exports = new ThongKeModel();