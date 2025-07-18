const nodemailer = require("nodemailer");
require("dotenv").config();

const sendVerificationEmail = async (toEmail, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  // const verifyLink = `${process.env.BASE_URL}/xac-thuc-email?token=${token}`;
  const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"HNOSS Fashion 👗" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Xác thực tài khoản HNOSS",
    html: `
      <h3>Chào bạn,</h3>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>HNOSS</strong>.</p>
      <p>Vui lòng nhấn vào liên kết bên dưới để xác thực tài khoản:</p>
      <a href="${verifyLink}">Xác thực tài khoản</a>
      <br><br>
      <small>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</small>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
