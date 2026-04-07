const { poolPromise, sql } = require('../config/db');

class PhongModel {
    // 1. Lấy danh sách tất cả phòng chiếu (Dùng cho trang thêm Suất chiếu)
    async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.*, r.TEN_RAP 
            FROM PHONG_CHIEU p
            JOIN THONG_TIN_RAP r ON p.MA_RAP = r.MA_RAP
        `);
        return result.recordset;
    }

    // 2. Thêm phòng chiếu mới và trả về ID vừa sinh ra (Để tự động tạo ghế)
    async create(data) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ten', sql.NVarChar, data.ten)
            .input('maRap', sql.Int, data.maRap)
            // Lệnh OUTPUT INSERTED.MA_PHONG_CHIEU giúp lấy lại ID của phòng vừa tạo
            .query(`
                INSERT INTO PHONG_CHIEU (TEN_PHONG_CHIEU, MA_RAP) 
                OUTPUT INSERTED.MA_PHONG_CHIEU
                VALUES (@ten, @maRap)
            `);
        return result;
    }
}

module.exports = new PhongModel();