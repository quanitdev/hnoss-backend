const express = require("express");
const router = express.Router();
const db = require("../config/db"); // PostgreSQL client (pg hoặc pg-promise)
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
    const { rows: existingUsers } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5)",
      [name, email, hashedPassword, "user", false]
    );

    const { rows: userRows } = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    const userId = userRows[0].id;

    const verifyToken = jwt.sign({ id: userId }, process.env.EMAIL_SECRET, { expiresIn: "1h" });
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

  if (!token) return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [decoded.id]);

    if (!rows[0]) {
      return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);
    }

    if (rows[0].is_verified) {
      return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=true&email=${rows[0].email}`);
    }

    await db.query("UPDATE users SET is_verified = true WHERE id = $1", [decoded.id]);

    return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=true&email=${rows[0].email}`);
  } catch (err) {
    console.error("❌ Lỗi xác thực email:", err.message);
    return res.redirect(`${process.env.CLIENT_URL}/xac-thuc-email?success=false`);
  }
});

// ================== ĐĂNG NHẬP ==================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Email không tồn tại." });

    const user = rows[0];

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

// ================== XÁC THỰC TOKEN ==================
router.get("/verify-token", verifyToken, (req, res) => {
  res.json({
    message: "Token hợp lệ!",
    user: req.user,
  });
});

module.exports = router;
