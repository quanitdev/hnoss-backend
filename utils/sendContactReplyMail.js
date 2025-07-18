const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Lấy từ biến môi trường
    pass: process.env.EMAIL_PASS, // Lấy từ biến môi trường
  },
});

const sendContactReplyMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"HNOSS Fashion 👗" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendContactReplyMail;
