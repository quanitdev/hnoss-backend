require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Gửi email thông báo giao hàng thành công của HNOSS
 * @param {Object} param0
 * @param {Object} param0.order - Thông tin đơn hàng
 * @param {Object} param0.user - Thông tin user nhận hàng
 * @param {Array} param0.products - Danh sách sản phẩm trong đơn
 * @param {string} param0.to - Email người nhận
 * @param {string} [param0.logo] - Link logo (ưu tiên truyền vào, nếu không sẽ lấy từ .env)
 * @param {string} [param0.hotline] - Hotline (ưu tiên truyền vào, nếu không sẽ lấy từ .env)
 * @param {string} [param0.email] - Email liên hệ (ưu tiên truyền vào, nếu không sẽ lấy từ .env)
 * @returns {Promise} Trả về promise gửi mail
 */
async function sendOrderSuccessMail({
  order,
  user,
  products,
  to,
  logo = process.env.HNOSS_LOGO || "https://res.cloudinary.com/dcxyyi9mg/image/upload/v1752293958/logo_kunohs.png",
  hotline = process.env.HNOSS_HOTLINE || "0987 647 494",
  email = process.env.HNOSS_EMAIL || "hnoss@gmail.com",
}) {
  // Tạo HTML
  const html = `
  <div style="font-family: Arial, sans-serif; color: #222; max-width:600px; margin:auto; background:#fff; border-radius:8px; border:1px solid #eee;">
    <div style="text-align:center; padding:24px 0 8px 0;">
      <img src="${logo}" alt="HNOSS" style="height:48px; margin-bottom:8px;" />
      <h2 style="color:#d0011b; margin:0 0 8px 0;">ĐƠN HÀNG GIAO THÀNH CÔNG</h2>
    </div>
    <div style="padding:0 24px;">
      <p>Xin chào <b>${user?.name || ""}</b>,<br>
      Đơn hàng <b>#${
        order?.id || ""
      }</b> của bạn đã được giao thành công ngày <b>${new Date().toLocaleDateString()}</b>.</p>
      <p style="margin:16px 0;">
        Vui lòng kiểm tra sản phẩm và xác nhận hài lòng với đơn hàng trong 3 ngày.<br>
        Nếu có vấn đề, hãy liên hệ với chúng tôi qua hotline hoặc email bên dưới.
      </p>
      <div style="text-align:center; margin:24px 0;">
        <a href="#" style="background:#d0011b; color:#fff; padding:12px 32px; border-radius:4px; text-decoration:none; font-weight:bold; display:inline-block;">Đã nhận hàng</a>
      </div>
      <h3 style="margin:24px 0 8px 0; color:#d0011b;">THÔNG TIN ĐƠN HÀNG</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        <tr>
          <td style="padding:6px 0;"><b>Mã đơn hàng:</b></td>
          <td style="padding:6px 0;">#${order?.id || ""}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><b>Ngày đặt:</b></td>
          <td style="padding:6px 0;">${
            order?.created_at ? new Date(order.created_at).toLocaleString() : ""
          }</td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><b>Khách hàng:</b></td>
          <td style="padding:6px 0;">${user?.name || ""}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><b>Địa chỉ nhận hàng:</b></td>
          <td style="padding:6px 0;">${order?.shipping_address || ""}</td>
        </tr>
      </table>
      <div style="margin-bottom:12px;">
        <b>Danh sách sản phẩm:</b>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr style="background:#f6f8fa;">
              <th style="padding:8px; border:1px solid #eee;">Hình ảnh</th>
              <th style="padding:8px; border:1px solid #eee;">Tên sản phẩm</th>
              <th style="padding:8px; border:1px solid #eee;">Số lượng</th>
              <th style="padding:8px; border:1px solid #eee;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${(products || [])
              .map(
                (p) => `
              <tr>
                <td style="padding:8px; border:1px solid #eee; text-align:center;">
                  <img src="${p.img}" alt="${
                  p.name
                }" style="height:48px; border-radius:4px;" />
                </td>
                <td style="padding:8px; border:1px solid #eee;">${p.name}</td>
                <td style="padding:8px; border:1px solid #eee; text-align:center;">${
                  p.quantity
                }</td>
                <td style="padding:8px; border:1px solid #eee;">${p.price?.toLocaleString()}đ</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <!-- Bảng chi tiết thanh toán -->
      <div style="margin:16px 0;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;"><b>Tổng tiền:</b></td>
            <td style="padding:4px 0; text-align:right;">${
              order?.total_price?.toLocaleString() || ""
            }đ</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b>Voucher từ HNOSS:</b></td>
            <td style="padding:4px 0; text-align:right;">${
              order?.discount_amount
                ? "-" + order.discount_amount.toLocaleString() + "đ"
                : "0đ"
            }</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b>Mã giảm giá:</b></td>
            <td style="padding:4px 0; text-align:right;">${
              order?.discount_code || ""
            }</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b>Phí vận chuyển:</b></td>
            <td style="padding:4px 0; text-align:right;">${
              order?.shipping_fee
                ? order.shipping_fee.toLocaleString() + "đ"
                : "0đ"
            }</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><b><span style="color:#d0011b;">Tổng thanh toán:</span></b></td>
            <td style="padding:4px 0; text-align:right;"><b><span style="color:#d0011b; font-size:16px;">${
              order?.total_pay?.toLocaleString() || ""
            }đ</span></b></td>
          </tr>
        </table>
      </div>
      <div style="margin:16px 0;">
        <b>Tổng tiền:</b> <span style="color:#d0011b; font-size:18px;">${
          order?.total_pay?.toLocaleString() || ""
        }đ</span>
      </div>
      <hr style="margin:24px 0;">
      <div style="text-align:center; color:#888; font-size:13px;">
        <b>HNOSS</b> - Hotline: ${hotline} - Email: ${email}
      </div>
    </div>
  </div>
`;

  // Tạo transporter (dùng Gmail hoặc SMTP khác)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Gửi mail với xử lý lỗi
  try {
    const info = await transporter.sendMail({
      from: `"HNOSS" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Đơn hàng của bạn đã giao thành công - HNOSS",
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Lỗi khi gửi email:", error.message);
    throw new Error("Không thể gửi email thông báo giao hàng thành công.");
  }
}

module.exports = { sendOrderSuccessMail };
