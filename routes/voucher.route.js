// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");

// // Lấy danh sách voucher của user
// router.get("/user/:user_id", async (req, res) => {
//   const user_id = req.params.user_id;
//   try {
//     const [vouchers] = await db.execute(
//       `SELECT id, code, discount, expiry_date FROM sales WHERE user_id = ? ORDER BY expiry_date DESC`,
//       [user_id]
//     );
//     res.json(vouchers);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server khi lấy voucher." });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Đảm bảo bạn đã dùng pool pg từ pg hoặc pg-promise

// Lấy danh sách voucher của user
router.get("/user/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const result = await db.query(
      `SELECT id, code, discount, expiry_date FROM sales WHERE user_id = $1 ORDER BY expiry_date DESC`,
      [user_id]
    );
    res.json(result.rows); // PostgreSQL trả về result.rows
  } catch (err) {
    console.error("Lỗi khi truy vấn voucher:", err);
    res.status(500).json({ message: "Lỗi server khi lấy voucher." });
  }
});

module.exports = router;
