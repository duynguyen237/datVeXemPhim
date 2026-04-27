const { poolPromise, sql } = require('../config/db');
class SuatChieuModel {
    async getByPhim(maPhim) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('maPhim', sql.Int, maPhim)
            .query(`
                SELECT SC.MA_SUAT_CHIEU, 
                       LEFT(CAST(SC.GIO_BAT_DAU AS TIME), 5) AS GIO_FORMAT, 
                       CONVERT(VARCHAR, SC.NGAY_CHIEU, 103) as NGAY_FORMAT,
                       R.TEN_RAP, P.TEN_PHONG_CHIEU
                FROM SUAT_CHIEU SC
                JOIN THONG_TIN_RAP R ON SC.MA_RAP = R.MA_RAP
                JOIN PHONG_CHIEU P ON SC.MA_PHONG_CHIEU = P.MA_PHONG_CHIEU
                WHERE SC.MA_PHIM = @maPhim 
                ORDER BY SC.NGAY_CHIEU, SC.GIO_BAT_DAU
            `);
        return result.recordset;
    }
    // models/SuatChieuModel.js

    async getDetailById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
            SELECT 
                SC.MA_SUAT_CHIEU, 
                SC.GIA_VE_CO_BAN, 
                P.TEN_PHIM, 
                P.HINH_ANH_POSTER, -- <--- THÊM DÒNG NÀY ĐỂ LẤY ẢNH
                R.TEN_RAP, 
                PC.TEN_PHONG_CHIEU,
                LEFT(CAST(SC.GIO_BAT_DAU AS TIME), 5) AS GIO_FORMAT,
                CONVERT(VARCHAR, SC.NGAY_CHIEU, 103) AS NGAY_FORMAT
            FROM SUAT_CHIEU SC
            JOIN PHIM P ON SC.MA_PHIM = P.MA_PHIM
            JOIN THONG_TIN_RAP R ON SC.MA_RAP = R.MA_RAP
            JOIN PHONG_CHIEU PC ON SC.MA_PHONG_CHIEU = PC.MA_PHONG_CHIEU
            WHERE SC.MA_SUAT_CHIEU = @id
        `);
        return result.recordset[0];
    }
    async getAllAdmin() {
        try {
            const pool = await poolPromise;
            const sqlQuery = `
            SELECT 
                SC.MA_SUAT_CHIEU, 
                P.TEN_PHIM, 
                R.TEN_RAP, -- <--- Phải có cột này
                PC.TEN_PHONG_CHIEU AS TEN_PHONG, 
                SC.NGAY_CHIEU, 
                CONVERT(VARCHAR(5), SC.GIO_BAT_DAU, 108) AS GIO_BAT_DAU, 
                SC.GIA_VE_CO_BAN 
            FROM SUAT_CHIEU SC
            JOIN PHIM P ON SC.MA_PHIM = P.MA_PHIM
            JOIN PHONG_CHIEU PC ON SC.MA_PHONG_CHIEU = PC.MA_PHONG_CHIEU
            JOIN THONG_TIN_RAP R ON SC.MA_RAP = R.MA_RAP -- <--- Phải JOIN mới có tên
            ORDER BY SC.MA_SUAT_CHIEU DESC
        `;
            const result = await pool.request().query(sqlQuery);
            return result.recordset;
        } catch (error) {
            console.error("❌ Lỗi Model getAllAdmin:", error.message);
            throw error;
        }
    }
    // 2. Hàm thêm suất chiếu mới (Controller của bạn đang gọi hàm này)
    async create({ maPhim, maRap, maPhong, ngay, gio, gia }) {
        try {
            const pool = await poolPromise;
            // Xử lý maRap mặc định là 1 nếu bạn chưa làm bảng RAP
            const rapId = maRap || 1;

            await pool.request()
                .input('MaPhim', sql.Int, maPhim)
                .input('MaPhong', sql.Int, maPhong)
                .input('MaRap', sql.Int, rapId)
                .input('NgayChieu', sql.Date, ngay)
                .input('GioBatDau', sql.VarChar, gio)
                // Giờ kết thúc tạm thời để trống hoặc cho tự cộng thêm 2 tiếng
                .input('GioKetThuc', sql.VarChar, '')
                .input('GiaVe', sql.Int, gia)
                .query(`
                    INSERT INTO SUAT_CHIEU 
                    (MA_PHIM, MA_PHONG_CHIEU, MA_RAP, NGAY_CHIEU, GIO_BAT_DAU, GIO_KET_THUC, GIA_VE_CO_BAN) 
                    VALUES 
                    (@MaPhim, @MaPhong, @MaRap, @NgayChieu, @GioBatDau, @GioKetThuc, @GiaVe)
                `);
            return true;
        } catch (error) {
            console.error("Lỗi thêm suất chiếu trong Model:", error.message);
            throw error;
        }
    }
    async checkDaMuaVe(maND, maPhim) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uId', sql.Int, maND)
            .input('pId', sql.Int, maPhim)
            .query(`
                SELECT TOP 1 1 AS IsBought
                FROM HOA_DON hd
                JOIN SUAT_CHIEU sc ON hd.MA_SUAT_CHIEU = sc.MA_SUAT_CHIEU
                WHERE hd.MA_NGUOI_DUNG = @uId 
                  AND hd.TRANG_THAI_THANH_TOAN = N'Đã thanh toán'
                  AND sc.MA_PHIM = @pId
            `);
        // Trả về true nếu có kết quả (Đã mua), false nếu mảng rỗng (Chưa mua)
        return result.recordset.length > 0;
    }
}
module.exports = new SuatChieuModel();