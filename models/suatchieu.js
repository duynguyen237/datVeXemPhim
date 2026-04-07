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
    async getDetailById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT SC.MA_SUAT_CHIEU, SC.GIA_VE_CO_BAN, P.TEN_PHIM, R.TEN_RAP, PC.TEN_PHONG_CHIEU,
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
            const result = await pool.request().query(`
                SELECT 
                    SC.MA_SUAT_CHIEU, 
                    P.TEN_PHIM, 
                    PC.TEN_PHONG_CHIEU AS TEN_PHONG, 
                    SC.NGAY_CHIEU, 
                    
                    -- FIX LỖI GIỜ CHIẾU: Ép SQL Server chỉ trả về chuỗi Giờ:Phút (HH:mm)
                    CONVERT(VARCHAR(5), SC.GIO_BAT_DAU, 108) AS GIO_BAT_DAU, 
                    
                    SC.GIA_VE_CO_BAN 
                FROM SUAT_CHIEU SC
                JOIN PHIM P ON SC.MA_PHIM = P.MA_PHIM
                JOIN PHONG_CHIEU PC ON SC.MA_PHONG_CHIEU = PC.MA_PHONG_CHIEU
                
                -- FIX LỖI SẮP XẾP: Sắp xếp theo Mã Suất Chiếu giảm dần (Suất mới tạo lên đầu)
                ORDER BY SC.MA_SUAT_CHIEU DESC
            `);
            return result.recordset;
        } catch (error) {
            console.error("Lỗi lấy danh sách suất chiếu:", error.message);
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
}
module.exports = new SuatChieuModel();