/* public/js/thanhtoan.js */

const params = new URLSearchParams(window.location.search);
const maSC = params.get('maSC');
const ghesStr = params.get('ghes');
const combosStr = params.get('combos');

let finalTotalAmount = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadOrderDetails();
});

// 1. TỰ ĐỘNG LẤY THÔNG TIN TỪ TÀI KHOẢN
function loadUserInfo() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);

        document.getElementById('cus_name').value = user.HO_TEN || '';
        document.getElementById('cus_phone').value = user.SO_DIEN_THOAI || '';
        document.getElementById('cus_email').value = user.EMAIL || '';

        // Khóa input để tránh khách sửa sai dữ liệu DB
        document.getElementById('cus_name').readOnly = true;
        document.getElementById('cus_phone').readOnly = true;
        document.getElementById('cus_email').readOnly = true;
    } else {
        alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.");
        window.location.href = '/login';
    }
}

// 2. TÍNH TIỀN VÀ HIỂN THỊ ĐƠN HÀNG
async function loadOrderDetails() {
    const body = document.getElementById('billing-body');
    let total = 0;

    try {
        const resSC = await fetch(`/api/suat-chieu/thong-tin/${maSC}`);
        const dataSC = await resSC.json();
        const basePrice = parseFloat(dataSC.data.GIA_VE_CO_BAN) || 0;

        const resGhe = await fetch(`/api/ghe/sodo/${maSC}`);
        const dataGhe = await resGhe.json();
        const selectedGheIds = ghesStr.split(',');

        let html = '';

        // Render Vé
        dataGhe.data.filter(g => selectedGheIds.includes(g.MA_GHE_NGOI.toString())).forEach(g => {
            const phuPhi = parseFloat(g.PHU_PHI_GHE) || 0;
            const price = basePrice + phuPhi;
            total += price;
            html += `<tr>
                <td>Ghế ${g.TEN_GHE_NGOI} <span class="badge bg-danger ms-1">${phuPhi > 0 ? 'VIP' : 'Thường'}</span></td>
                <td class="text-center">1</td>
                <td class="text-end">${price.toLocaleString('vi-VN')} đ</td>
            </tr>`;
        });

        // Render Combo (Bắp Nước)
        if (combosStr) {
            const resSp = await fetch('/api/san-pham');
            const dataSp = await resSp.json();

            combosStr.split('|').forEach(item => {
                const [id, qty] = item.split(':');
                const p = dataSp.data.find(x => x.MA_SAN_PHAM == id);
                if (p) {
                    const priceSp = parseFloat(p.GIA_BAN) || parseFloat(p.GIA) || 0;
                    const sub = priceSp * parseInt(qty);
                    total += sub;
                    html += `<tr>
                        <td>${p.TEN_SAN_PHAM}</td>
                        <td class="text-center">${qty}</td>
                        <td class="text-end">${sub.toLocaleString('vi-VN')} đ</td>
                    </tr>`;
                }
            });
        }

        body.innerHTML = html;
        finalTotalAmount = total;
        document.getElementById('final-total').innerText = total.toLocaleString('vi-VN') + " VNĐ";

    } catch (err) {
        console.error("Lỗi load chi tiết:", err);
        body.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu. Vui lòng tải lại trang.</td></tr>';
    }
}

// 3. XỬ LÝ THANH TOÁN VÀ CHUYỂN HƯỚNG VNPAY
async function submitOrder() {
    const userData = localStorage.getItem('user');
    if (!userData) return alert("Lỗi: Không tìm thấy thông tin người dùng!");

    const user = JSON.parse(userData);
    const danhSachMaGhe = ghesStr.split(',').map(id => parseInt(id));

    const btn = document.querySelector('button[onclick="submitOrder()"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang tạo giao dịch VNPay...';

    try {
        const res = await fetch('/api/ve/dat-ve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maNguoiDung: user.MA_NGUOI_DUNG,
                maSuatChieu: parseInt(maSC),
                danhSachMaGhe: danhSachMaGhe,
                tongTien: finalTotalAmount
            })
        });

        const result = await res.json();

        if (result.success && result.paymentUrl) {
            window.location.href = result.paymentUrl;
        } else {
            alert("Lỗi tạo đơn hàng: " + (result.message || "Không xác định"));
            btn.disabled = false;
            btn.innerHTML = 'XÁC NHẬN & THANH TOÁN';
        }
    } catch (error) {
        console.error("Lỗi submit:", error);
        alert("Lỗi kết nối tới server đặt vé!");
        btn.disabled = false;
        btn.innerHTML = 'XÁC NHẬN & THANH TOÁN';
    }
}