/* public/js/thanhtoan.js */
const params = new URLSearchParams(window.location.search);
const [maSC, ghesStr, combosStr] = ['maSC', 'ghes', 'combos'].map(k => params.get(k));

let finalTotalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadOrderDetails();
});

// 1. TỰ ĐỘNG LẤY THÔNG TIN TỪ TÀI KHOẢN (Đã tối ưu)
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("Vui lòng đăng nhập để tiếp tục.");
        return window.location.href = '/login';
    }

    const fields = { cus_name: 'HO_TEN', cus_phone: 'SO_DIEN_THOAI', cus_email: 'EMAIL' };
    for (let id in fields) {
        const el = document.getElementById(id);
        if (el) {
            el.value = user[fields[id]] || '';
            el.readOnly = true;
        }
    }
}

// 2. TÍNH TIỀN VÀ HIỂN THỊ ĐƠN HÀNG (Sửa lỗi dính chữ và nhân số lượng)
/* public/js/thanhtoan.js */

async function loadOrderDetails() {
    const body = document.getElementById('billing-body');
    if (!body) return;

    try {
        const [resSC, resGhe, resSp] = await Promise.all([
            fetch(`/api/suat-chieu/thong-tin/${maSC}`).then(r => r.json()),
            fetch(`/api/ghe/sodo/${maSC}`).then(r => r.json()),
            combosStr ? fetch('/api/san-pham').then(r => r.json()) : Promise.resolve({ success: true, data: [] })
        ]);

        const basePrice = Number(resSC.data?.GIA_VE_CO_BAN) || 0;
        const selectedGheIds = ghesStr ? ghesStr.split(',') : [];
        let htmlRows = "";
        finalTotalAmount = 0;

        // 1. XỬ LÝ GHẾ
        if (resGhe.success && resGhe.data) {
            const selectedGhes = resGhe.data.filter(g => selectedGheIds.includes(String(g.MA_GHE_NGOI)));

            selectedGhes.forEach(g => {
                const phuPhi = Number(g.PHU_PHI_GHE) || 0;
                const price = basePrice + phuPhi;
                finalTotalAmount += price;

                htmlRows += `<tr>
                    <td>Ghế ${g.TEN_GHE_NGOI} ${phuPhi > 0 ? '<span class="badge bg-danger ms-1">VIP</span>' : ''}</td>
                    <td class="text-center">1</td>
                    <td class="text-end">${price.toLocaleString('vi-VN')} đ</td>
                </tr>`;
            });
        }

        // 2. XỬ LÝ COMBO (FIX LỖI HIỂN THỊ "SỐ 3")
        if (combosStr && resSp.success && resSp.data) {
            const items = combosStr.split('|');
            items.forEach(item => {
                const parts = item.split(':');
                const id = parts[0];
                const qty = Number(parts[1]) || 0;

                const product = resSp.data.find(x => String(x.MA_SAN_PHAM) === String(id));

                if (product && qty > 0) {
                    const unitPrice = Number(product.GIA_SAN_PHAM) || 0;
                    const subTotal = unitPrice * qty; // Tính toán thuần số học

                    finalTotalAmount += subTotal;

                    // Template literal sạch sẽ, không có ký tự thừa
                    htmlRows += `<tr>
                        <td>${product.TEN_SAN_PHAM}</td>
                        <td class="text-center">${qty}</td>
                        <td class="text-end">${subTotal.toLocaleString('vi-VN')} đ</td>
                    </tr>`;
                }
            });
        }

        // 3. ĐỔ DỮ LIỆU VÀ CẬP NHẬT TỔNG TIỀN
        body.innerHTML = htmlRows || '<tr><td colspan="3" class="text-center text-muted">Đơn hàng trống</td></tr>';

        // Đảm bảo cập nhật đúng ID final-total trong EJS của em
        const finalTotalEl = document.getElementById('final-total');
        if (finalTotalEl) {
            finalTotalEl.innerText = finalTotalAmount.toLocaleString('vi-VN') + " VNĐ";
        }

    } catch (err) {
        console.error("Lỗi:", err);
        body.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu.</td></tr>';
    }
}

// 3. XỬ LÝ THANH TOÁN
async function submitOrder() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Vui lòng đăng nhập!");

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
                danhSachMaGhe: ghesStr.split(',').map(Number),
                tongTien: finalTotalAmount // Tổng tiền cuối cùng đã bao gồm ghế + bắp nước
            })
        });

        const result = await res.json();
        if (result.success && result.paymentUrl) {
            window.location.href = result.paymentUrl;
        } else {
            throw new Error(result.message || "Không thể tạo link thanh toán");
        }
    } catch (error) {
        console.error("Lỗi submit:", error);
        alert("Lỗi: " + error.message);
        btn.disabled = false;
        btn.innerHTML = 'XÁC NHẬN & THANH TOÁN';
    }
}