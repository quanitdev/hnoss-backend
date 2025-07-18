
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../utils/sendMail");
const { verifyToken } = require("../middlewares/auth.middleware");
require("dotenv").config();

// ================== ĐĂNG KÝ ==================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });

  if (password.length < 8)
    return res.status(400).json({ message: "Mật khẩu phải ít nhất 8 ký tự." });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users ( name, email, password, role, is_verified) VALUES ( ?, ?, ?, ?, ?)",
      [ name, email, hashedPassword, "user", 0]
    );

    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    const userId = userRows[0].id;

    // Tạo token xác thực email có thời hạn 1 giờ
    const verifyToken = jwt.sign({ id: userId }, process.env.EMAIL_SECRET, { expiresIn: "1h" });

    // Gửi email xác thực
    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server." });
  }
});

//================== XÁC THỰC EMAIL ==================
router.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  console.log("🔐 Nhận token:", token);

  if (!token) return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    console.log("✅ Decode thành công:", decoded);

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);

    if (!user[0]) {
      console.log("❌ Không tìm thấy user.");
      return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);
    }

    if (user[0].is_verified) {
      console.log("🔁 Đã xác thực rồi.");
return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=true&email=${user[0].email}`);
    }

    await db.query("UPDATE users SET is_verified = 1 WHERE id = ?", [decoded.id]);

    console.log("✅ Đã cập nhật xác thực.");
return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=true&email=${user[0].email}`);
  } catch (err) {
    console.error("❌ Lỗi xác thực email:", err.message);
    return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);
  }
});

// ================== XÁC THỰC EMAIL ==================
// router.get("/verify-email", async (req, res) => {
//   const token = req.query.token;

//   // Nếu không có token thì redirect về login luôn
//   if (!token) {
//     return res.redirect(`${process.env.CLIENT_URL}/dang-nhap`);
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
//     const [user] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);

//     // Nếu user tồn tại và chưa xác thực thì cập nhật
//     if (user[0] && user[0].is_verified === 0) {
//       await db.query("UPDATE users SET is_verified = 1 WHERE id = ?", [decoded.id]);
//     }

//     // Dù thành công hay đã xác thực từ trước => luôn chuyển về đăng nhập
// return res.redirect(`${process.env.CLIENT_URL}/quan-tri/dang-nhap?email=${user[0].email}`);

//   } catch (err) {
//     console.error("Lỗi xác thực email:", err.message);

//     // Lỗi token hoặc token hết hạn => vẫn chuyển về trang đăng nhập
// return res.redirect(`${process.env.CLIENT_URL}/quan-tri/dang-nhap?email=${user[0].email}`);
//   }
// });

// ================== ĐĂNG NHẬP ==================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0)
      return res.status(401).json({ message: "Email không tồn tại." });

    const user = results[0];

    if (!user.is_verified)
      return res.status(403).json({ message: "Tài khoản chưa được xác thực qua email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu." });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Đăng nhập thành công.",
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server." });
  }
});

// ================== XÁC THỰC TOKEN (Bảo vệ route) ==================
router.get("/verify-token", verifyToken, (req, res) => {
  res.json({
    message: "Token hợp lệ!",
    user: req.user,
  });
});

module.exports = router;
