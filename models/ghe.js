const { poolPromise, sql } = require('../config/db');

class ghe {
    async getBySuatChieu(maSuatChieu) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('maSC', sql.Int, maSuatChieu)
                .query(`
                    SELECT 
                        g.MA_GHE_NGOI, 
                        g.TEN_GHE_NGOI, 
                        g.LOAI_GHE, -- Giả sử bạn có cột phân loại VIP/Thường
                        g.GIA_GHE_NGOI AS PHU_PHI, -- Tiền cộng thêm của ghế
                        sc.GIA_VE_CO_BAN,
                        -- Kiểm tra xem ghế này đã có vé trong suất chiếu này chưa
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM VE_XEM_PHIM v 
                                WHERE v.MA_GHE_NGOI = g.MA_GHE_NGOI 
                                AND v.MA_SUAT_CHIEU = sc.MA_SUAT_CHIEU
                            ) THEN 1 
                            ELSE 0 
                        END AS DA_DAT
                    FROM GHE_NGOI g
                    JOIN SUAT_CHIEU sc ON g.MA_PHONG_CHIEU = sc.MA_PHONG_CHIEU
                    WHERE sc.MA_SUAT_CHIEU = @maSC
                    ORDER BY g.TEN_GHE_NGOI ASC
                `);
            return result.recordset;
        } catch (error) {
            console.error("Lỗi getBySuatChieu:", error);
            throw error;
        }
    }
    // models/gheModel.js
    async getBySuatChieu(maSuatChieu) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('maSC', sql.Int, maSuatChieu)
            .query(`
            SELECT 
                g.MA_GHE_NGOI, 
                g.TEN_GHE_NGOI, 
                g.GIA_GHE_NGOI AS PHU_PHI_GHE, 
                sc.GIA_VE_CO_BAN,            
                CASE WHEN v.MA_VE_XEM_PHIM IS NOT NULL THEN 1 ELSE 0 END AS DA_DAT
            FROM GHE_NGOI g
            JOIN SUAT_CHIEU sc ON g.MA_PHONG_CHIEU = sc.MA_PHONG_CHIEU
            LEFT JOIN VE_XEM_PHIM v ON g.MA_GHE_NGOI = v.MA_GHE_NGOI 
                                    AND v.MA_SUAT_CHIEU = sc.MA_SUAT_CHIEU
            WHERE sc.MA_SUAT_CHIEU = @maSC
            ORDER BY g.TEN_GHE_NGOI ASC
        `);
        return result.recordset;
    }
    async insertGhe({ maPhong, tenGhe, gia }) {
        try {
            const pool = await poolPromise;

            // Xác định loại ghế (VIP hoặc Thường) dựa trên giá truyền vào
            const loaiGhe = (gia > 0) ? 'VIP' : 'Thường';

            await pool.request()
                .input('MaPhong', sql.Int, maPhong)
                .input('TenGhe', sql.VarChar, tenGhe)
                .input('TrangThaiGhe', sql.NVarChar, loaiGhe)    // Cột TRANG_THAI_GHE
                .input('GiaGhe', sql.Decimal(18, 2), gia)        // Cột GIA_GHE_NGOI
                .input('TinhTrangDat', sql.Int, 0)               // Cột TINH_TRANG_DAT_GHE (Mặc định 0 là Trống)
                .query(`
                    INSERT INTO GHE_NGOI 
                    (MA_PHONG_CHIEU, TEN_GHE_NGOI, TRANG_THAI_GHE, GIA_GHE_NGOI, TINH_TRANG_DAT_GHE) 
                    VALUES 
                    (@MaPhong, @TenGhe, @TrangThaiGhe, @GiaGhe, @TinhTrangDat)
                `);
            return true;
        } catch (error) {
            console.error("Lỗi insertGhe trong Model:", error.message);
            throw error;
        }
    }
    // Thêm hàm này vào dưới hàm insertGhe
    async getGheByPhong(maPhong) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaPhong', sql.Int, maPhong)
                .query(`
                    SELECT MA_GHE_NGOI, TEN_GHE_NGOI, TRANG_THAI_GHE 
                    FROM GHE_NGOI 
                    WHERE MA_PHONG_CHIEU = @MaPhong
                    -- Cắt chữ cái đầu tiên để xếp theo thứ tự A, B, C và số 1, 2, 3
                    ORDER BY LEFT(TEN_GHE_NGOI, 1), CAST(SUBSTRING(TEN_GHE_NGOI, 2, LEN(TEN_GHE_NGOI)) AS INT)
                `);
            return result.recordset;
        } catch (error) {
            console.error("Lỗi lấy sơ đồ ghế:", error.message);
            throw error;
        }
    }
}
module.exports = new ghe();