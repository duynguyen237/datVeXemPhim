const params = new URLSearchParams(window.location.search);
const [maSC, ghesStr, combosStr] = ['maSC', 'ghes', 'combos'].map(k => params.get(k));

let finalTotalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadOrderDetails();
});

// 1. TỰ ĐỘNG LẤY THÔNG TIN TỪ TÀI KHOẢN
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Vui lòng đăng nhập để tiếp tục.");
        return window.location.href = '/login';
    }

    // Gán dữ liệu và khóa input ngắn gọn
    const fields = { cus_name: 'HO_TEN', cus_phone: 'SO_DIEN_THOAI', cus_email: 'EMAIL' };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) {
            el.value = user[fields[id]] || '';
            el.readOnly = true;
        }
    }
}

// 2. TÍNH TIỀN VÀ HIỂN THỊ ĐƠN HÀNG (TỐI ƯU GỌN LẠI VÀ CHẠY SONG SONG)
async function loadOrderDetails() {
    const body = document.getElementById('billing-body');

    try {
        // Dùng Promise.all để gọi các API cùng một lúc -> Tăng tốc độ load trang
        const [resSC, resGhe, resSp] = await Promise.all([
            fetch(`/api/suat-chieu/thong-tin/${maSC}`).then(r => r.json()),
            fetch(`/api/ghe/sodo/${maSC}`).then(r => r.json()),
            combosStr ? fetch('/api/san-pham').then(r => r.json()) : Promise.resolve({ data: [] })
        ]);

        const basePrice = parseFloat(resSC.data?.GIA_VE_CO_BAN) || 0;
        const selectedGheIds = ghesStr ? ghesStr.split(',') : [];
        let html = '';

        // Render Vé
        resGhe.data?.filter(g => selectedGheIds.includes(g.MA_GHE_NGOI.toString())).forEach(g => {
            const price = basePrice + (parseFloat(g.PHU_PHI_GHE) || 0);
            finalTotalAmount += price;
            html += `<tr>
                <td>Ghế ${g.TEN_GHE_NGOI} <span class="badge bg-danger ms-1">${g.PHU_PHI_GHE > 0 ? 'VIP' : 'Thường'}</span></td>
                <td class="text-center">1</td>
                <td class="text-end">${price.toLocaleString('vi-VN')} đ</td>
            </tr>`;
        });

        // Render Combo (Sử dụng đúng GIA_SAN_PHAM)
        if (combosStr && resSp.data) {
            combosStr.split('|').forEach(item => {
                const [id, qty] = item.split(':');
                const p = resSp.data.find(x => x.MA_SAN_PHAM == id);
                if (p) {
                    const sub = (parseFloat(p.GIA_SAN_PHAM) || 0) * parseInt(qty);
                    finalTotalAmount += sub;
                    html += `<tr>
                        <td>${p.TEN_SAN_PHAM}</td>
                        <td class="text-center">${qty}</td>
                        <td class="text-end">${sub.toLocaleString('vi-VN')} đ</td>
                    </tr>`;
                }
            });
        }
        body.innerHTML = html;
        document.getElementById('final-total').innerText = finalTotalAmount.toLocaleString('vi-VN') + " VNĐ";

    } catch (err) {
        console.error("Lỗi load chi tiết:", err);
        body.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu. Vui lòng tải lại trang.</td></tr>';
    }
}
// 3. XỬ LÝ THANH TOÁN VÀ CHUYỂN HƯỚNG VNPAY
async function submitOrder() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Lỗi: Không tìm thấy thông tin người dùng!");

    const btn = document.querySelector('button[onclick="submitOrder()"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang tạo giao dịch...';

    try {
        const res = await fetch('/api/ve/dat-ve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maNguoiDung: user.MA_NGUOI_DUNG,
                maSuatChieu: parseInt(maSC),
                danhSachMaGhe: ghesStr.split(',').map(Number), // Map thẳng sang mảng số nguyên
                tongTien: finalTotalAmount
            })
        });

        const result = await res.json();

        if (result.success && result.paymentUrl) {
            window.location.href = result.paymentUrl;
        } else {
            throw new Error(result.message || "Không xác định");
        }
    } catch (error) {
        console.error("Lỗi submit:", error);
        alert("Lỗi tạo đơn hàng: " + error.message);
        btn.disabled = false;
        btn.innerHTML = 'XÁC NHẬN & THANH TOÁN';
    }
}