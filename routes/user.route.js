// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const bcrypt = require("bcryptjs");

// // Lấy danh sách tất cả user
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await db.execute("SELECT id, username, name, email, role FROM users");
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Thêm user mới
// router.post("/", async (req, res) => {
//   const { username, name, email, password, role } = req.body;
//   if (!username || !name || !email || !password || !role)
//     return res.status(400).json({ message: "Thiếu thông tin" });
//   try {
//     const hash = await bcrypt.hash(password, 10);
//     await db.execute(
//       "INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
//       [username, name, email, hash, role]
//     );
//     res.json({ message: "Thêm user thành công!" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Xóa user
// router.delete("/:id", async (req, res) => {
//   try {
//     await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
//     res.json({ message: "Đã xóa user" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Cập nhật quyền user
// router.put("/:id/role", async (req, res) => {
//   const { role } = req.body;
//   if (!role) return res.status(400).json({ message: "Thiếu quyền" });
//   try {
//     await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
//     res.json({ message: "Cập nhật quyền thành công" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Lấy thông tin user theo id
// router.get("/:id", async (req, res) => {
//   const userId = req.params.id;
//   try {
//     const [rows] = await db.execute(
//       "SELECT id, username, name, email, role FROM users WHERE id = ?",
//       [userId]
//     );
//     if (!rows.length) return res.status(404).json({ message: "Không tìm thấy user" });
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Cập nhật thông tin user (tên, email)
// router.put("/:id", async (req, res) => {
//   const userId = req.params.id;
//   const { name, email } = req.body;
//   if (!name || !email) return res.status(400).json({ message: "Thiếu tên hoặc email" });
//   try {
//     await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
//     res.json({ message: "Cập nhật thông tin thành công!" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Đổi mật khẩu
// router.post("/change-password", async (req, res) => {
//   const { user_id, oldPassword, newPassword } = req.body;
//   if (!user_id || !oldPassword || !newPassword)
//     return res.status(400).json({ message: "Thiếu thông tin" });

//   try {
//     const [rows] = await db.execute("SELECT password FROM users WHERE id = ?", [user_id]);
//     if (!rows.length) return res.status(404).json({ message: "Không tìm thấy user" });

//     const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
//     if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

//     const hash = await bcrypt.hash(newPassword, 10);
//     await db.execute("UPDATE users SET password = ? WHERE id = ?", [hash, user_id]);
//     res.json({ message: "Đổi mật khẩu thành công" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const bcrypt = require("bcryptjs");

// // Lấy danh sách tất cả user
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await db.execute("SELECT id, name, email, role FROM users");
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Thêm user mới
// router.post("/", async (req, res) => {
//   const {  name, email, password, role } = req.body;
//   if ( !name || !email || !password || !role)
//     return res.status(400).json({ message: "Thiếu thông tin" });

//   try {
//     // Kiểm tra trùng email/username
//     const [exists] = await db.execute(
//       "SELECT id FROM users WHERE name = ? OR email = ?",
//       [name, email]
//     );
//     if (exists.length > 0)
//       return res.status(400).json({ message: "Username hoặc email đã tồn tại" });

//     const hash = await bcrypt.hash(password, 10);
//     await db.execute(
//       "INSERT INTO users ( name, email, password, role, is_verified) VALUES ( ?, ?, ?, ?,1)",
//       [ name, email, hash, role]
//     );
//     res.json({ message: "Thêm user thành công!" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Xóa user
// router.delete("/:id", async (req, res) => {
//   try {
//     await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
//     res.json({ message: "Đã xóa user" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Cập nhật quyền user
// router.put("/:id/role", async (req, res) => {
//   const { role } = req.body;
//   if (!role) return res.status(400).json({ message: "Thiếu quyền" });
//   try {
//     await db.execute("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
//     res.json({ message: "Cập nhật quyền thành công" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Lấy thông tin user theo id
// router.get("/:id", async (req, res) => {
//   const userId = req.params.id;
//   try {
//     const [rows] = await db.execute(
//       "SELECT id, name, email, role FROM users WHERE id = ?",
//       [userId]
//     );
//     if (!rows.length) return res.status(404).json({ message: "Không tìm thấy user" });
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Cập nhật thông tin user (tên, email)
// router.put("/:id", async (req, res) => {
//   const userId = req.params.id;
//   const { name, email } = req.body;
//   if (!name || !email) return res.status(400).json({ message: "Thiếu tên hoặc email" });
//   try {
//     await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
//     res.json({ message: "Cập nhật thông tin thành công!" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// // Đổi mật khẩu
// router.post("/change-password", async (req, res) => {
//   const { user_id, oldPassword, newPassword } = req.body;
//   if (!user_id || !oldPassword || !newPassword)
//     return res.status(400).json({ message: "Thiếu thông tin" });

//   try {
//     const [rows] = await db.execute("SELECT password FROM users WHERE id = ?", [user_id]);
//     if (!rows.length) return res.status(404).json({ message: "Không tìm thấy user" });

//     const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
//     if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

//     const hash = await bcrypt.hash(newPassword, 10);
//     await db.execute("UPDATE users SET password = ? WHERE id = ?", [hash, user_id]);
//     res.json({ message: "Đổi mật khẩu thành công" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../config/db"); // PostgreSQL Pool
const bcrypt = require("bcryptjs");

// Lấy danh sách tất cả user
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thêm user mới
router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "Thiếu thông tin" });

  try {
    const check = await db.query(
      "SELECT id FROM users WHERE name = $1 OR email = $2",
      [name, email]
    );
    if (check.rows.length > 0)
      return res.status(400).json({ message: "Username hoặc email đã tồn tại" });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, true)",
      [name, email, hash, role]
    );
    res.json({ message: "Thêm user thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa user
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "Đã xóa user" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật quyền user
router.put("/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "Thiếu quyền" });
  try {
    await db.query("UPDATE users SET role = $1 WHERE id = $2", [
      role,
      req.params.id,
    ]);
    res.json({ message: "Cập nhật quyền thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy thông tin user theo id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [userId]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật thông tin user (tên, email)
router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: "Thiếu tên hoặc email" });
  try {
    await db.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [name, email, userId]
    );
    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đổi mật khẩu
router.post("/change-password", async (req, res) => {
  const { user_id, oldPassword, newPassword } = req.body;
  if (!user_id || !oldPassword || !newPassword)
    return res.status(400).json({ message: "Thiếu thông tin" });

  try {
    const result = await db.query(
      "SELECT password FROM users WHERE id = $1",
      [user_id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Không tìm thấy user" });

    const isMatch = await bcrypt.compare(
      oldPassword,
      result.rows[0].password
    );
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hash,
      user_id,
    ]);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
