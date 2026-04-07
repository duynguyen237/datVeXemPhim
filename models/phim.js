const { poolPromise, sql } = require('../config/db');

class PhimModel {
    async getAll() {
        const pool = await poolPromise;
        // Join với bảng THE_LOAI để lấy tên thể loại hiển thị ra trang chủ
        const result = await pool.request().query(`
        SELECT p.*, tl.TEN_THE_LOAI 
        FROM PHIM p
        LEFT JOIN THE_LOAI tl ON p.MA_THE_LOAI = tl.MA_THE_LOAI
    `);
        return result.recordset;
    }
    // Lấy chi tiết 1 bộ phim
    async getById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT p.*, tl.TEN_THE_LOAI 
                FROM PHIM p 
                LEFT JOIN THE_LOAI tl ON p.MA_THE_LOAI = tl.MA_THE_LOAI 
                WHERE p.MA_PHIM = @id
            `);
        return result.recordset[0];
    }

    // Lấy danh sách thể loại để hiển thị trong Form Thêm/Sửa
    async getAllTheLoai() {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM THE_LOAI");
        return result.recordset;
    }

    // Thêm phim mới
    async create(data) {
        const pool = await poolPromise;
        return await pool.request()
            .input('ten', sql.NVarChar, data.ten)
            .input('trailer', sql.VarChar, data.trailer)
            .input('noidung', sql.NVarChar, data.noidung)
            .input('tuoi', sql.Int, data.tuoi)
            .input('thoiluong', sql.Int, data.thoiluong)
            .input('daodien', sql.NVarChar, data.daodien)
            .input('dienvien', sql.NVarChar, data.dienvien)
            .input('poster', sql.VarChar, data.poster)
            .input('nen', sql.VarChar, data.nen)
            .input('maTL', sql.Int, data.maTL)
            .query(`
            INSERT INTO PHIM (TEN_PHIM, DUONG_DAN_TRAILER, NOI_DUNG_PHIM, GIOI_HAN_TUOI, THOI_LUONG_PHIM, DAO_DIEN, DIEN_VIEN, HINH_ANH_POSTER, HINH_ANH_NEN, MA_THE_LOAI) 
            VALUES (@ten, @trailer, @noidung, @tuoi, @thoiluong, @daodien, @dienvien, @poster, @nen, @maTL)
        `);
    }

    // Cập nhật phim
    async update(id, data) {
        const pool = await poolPromise;
        return await pool.request()
            .input('id', sql.Int, id)
            .input('ten', sql.NVarChar, data.ten)
            .input('mota', sql.NVarChar, data.mota)
            .input('thoiluong', sql.Int, data.thoiluong)
            .input('anh', sql.VarChar, data.anh)
            .input('ngay', sql.Date, data.ngay)
            .input('maTL', sql.Int, data.maTL)
            .query(`
                UPDATE PHIM 
                SET TEN_PHIM = @ten, MO_TA = @mota, THOI_LUONG = @thoiluong, 
                    ANH_BIA = @anh, NGAY_KHOI_CHIEU = @ngay, MA_THE_LOAI = @maTL
                WHERE MA_PHIM = @id
            `);
    }

    // Xóa phim
    async delete(id) {
        const pool = await poolPromise;
        // Lưu ý: Nếu phim đã có suất chiếu, SQL sẽ báo lỗi khóa ngoại. 
        // Bạn nên xóa Suất chiếu của phim này trước nếu muốn xóa tuyệt đối.
        return await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM PHIM WHERE MA_PHIM = @id");
    }
}

module.exports = new PhimModel();