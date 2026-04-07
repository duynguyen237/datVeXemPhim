const { poolPromise, sql } = require('../config/db');

class RapModel {
    // Lấy danh sách tất cả cụm rạp (Bảng THONG_TIN_RAP)
    // Đã đổi tên hàm từ getAllRaps thành getAll để khớp với Controller
    async getAll() {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM THONG_TIN_RAP");
        return result.recordset;
    }

    // Lấy các phòng chiếu thuộc một rạp cụ thể (Bảng PHONG_CHIEU)
    async getPhongsByRap(maRap) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('maRap', sql.Int, maRap)
            .query("SELECT * FROM PHONG_CHIEU WHERE MA_RAP = @maRap");
        return result.recordset;
    }
}
module.exports = new RapModel();