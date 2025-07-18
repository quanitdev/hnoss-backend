// BE_HNOSS/controllers/user.controller.js
const sendMail = require("../utils/sendContactReplyMail");
const renderHnossWelcomeMail = require("../utils/renderHnossWelcomeMail");

exports.registerUser = async (req, res) => {
  // ... code tạo user ...
  // Giả sử user vừa tạo là biến user
  try {
    // Sau khi tạo user thành công:
    await sendMail({
      to: user.email,
      subject: "Chào mừng bạn đến với HNOSS!",
      html: renderHnossWelcomeMail({ name: user.name }),
    });
    res.json({ message: "Đăng ký thành công, đã gửi email chào mừng!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Đăng ký thành công nhưng gửi mail thất bại!" });
  }
};
