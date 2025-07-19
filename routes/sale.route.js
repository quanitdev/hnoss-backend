// // routes/sale.route.js

// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");

// // Lấy danh sách voucher
// router.get("/", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM sales ORDER BY id DESC");
//     res.json(rows);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Không thể lấy danh sách voucher", detail: err.message });
//   }
// });

// // Thêm voucher mới
// router.post("/", async (req, res) => {
//   const {
//     code,
//     discount_type,
//     discount_value,
//     min_order,
//     max_uses,
//     expires_at,
//   } = req.body;
//   if (
//     !code ||
//     !discount_type ||
//     !discount_value ||
//     !min_order ||
//     !max_uses ||
//     !expires_at
//   ) {
//     return res.status(400).json({ error: "Thiếu thông tin voucher" });
//   }
//   // Kiểm tra trùng mã
//   const [exists] = await db.query("SELECT id FROM sales WHERE code = ?", [
//     code,
//   ]);
//   if (exists.length > 0) {
//     return res.status(400).json({ error: "Mã voucher đã tồn tại" });
//   }
//   try {
//     await db.query(
//       `INSERT INTO sales (code, discount_type, discount_value, min_order, max_uses, expires_at, created_at, used_count)
//        VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)`,
//       [code, discount_type, discount_value, min_order, max_uses, expires_at]
//     );
//     res.json({ message: "Thêm voucher thành công" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Lỗi khi thêm voucher", detail: err.message });
//   }
// });

// // Kiểm tra mã giảm giá
// router.post("/check-code", async (req, res) => {
//   const { code, totalPrice } = req.body;
//   try {
//     const [rows] = await db.query("SELECT * FROM sales WHERE code = ?", [code]);
//     const sale = rows[0];
//     if (!sale)
//       return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
//     const now = new Date();
//     if (new Date(sale.expires_at) < now)
//       return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
//     if (sale.used_count >= sale.max_uses)
//       return res
//         .status(400)
//         .json({ message: "Mã giảm giá đã đạt giới hạn sử dụng." });
//     if (totalPrice < sale.min_order)
//       return res
//         .status(400)
//         .json({
//           message: `Đơn hàng cần tối thiểu ${sale.min_order.toLocaleString()}đ để áp dụng mã.`,
//         });
//     let discountAmount = 0;
//     if (sale.discount_type === "percent") {
//       discountAmount = (sale.discount_value / 100) * totalPrice;
//     } else if (sale.discount_type === "amount") {
//       discountAmount = sale.discount_value;
//     }
//     res.json({
//       message: "Áp dụng mã thành công.",
//       discount: sale.discount_value,
//       discountType: sale.discount_type,
//       discountAmount,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi hệ thống." });
//   }
// });

// // Sửa voucher
// router.put("/:id", async (req, res) => {
//   const {
//     code,
//     discount_type,
//     discount_value,
//     min_order,
//     max_uses,
//     expires_at,
//   } = req.body;
//   const { id } = req.params;
//   if (
//     !code ||
//     !discount_type ||
//     !discount_value ||
//     !min_order ||
//     !max_uses ||
//     !expires_at
//   ) {
//     return res.status(400).json({ error: "Thiếu thông tin voucher" });
//   }
//   // Kiểm tra trùng mã (trừ chính nó)
//   const [exists] = await db.query(
//     "SELECT id FROM sales WHERE code = ? AND id != ?",
//     [code, id]
//   );
//   if (exists.length > 0) {
//     return res.status(400).json({ error: "Mã voucher đã tồn tại" });
//   }
//   try {
//     await db.query(
//       `UPDATE sales SET code=?, discount_type=?, discount_value=?, min_order=?, max_uses=?, expires_at=? WHERE id=?`,
//       [code, discount_type, discount_value, min_order, max_uses, expires_at, id]
//     );
//     res.json({ message: "Cập nhật voucher thành công" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Lỗi khi cập nhật voucher", detail: err.message });
//   }
// });

// // Xóa voucher
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await db.query("DELETE FROM sales WHERE id = ?", [id]);
//     res.json({ message: "Đã xóa voucher" });
//   } catch (err) {
//     res.status(500).json({ error: "Lỗi khi xóa voucher", detail: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Lấy danh sách voucher
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM sales ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: "Không thể lấy danh sách voucher",
      detail: err.message,
    });
  }
});

// Thêm voucher mới
router.post("/", async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    min_order,
    max_uses,
    expires_at,
  } = req.body;

  if (
    !code ||
    !discount_type ||
    !discount_value ||
    !min_order ||
    !max_uses ||
    !expires_at
  ) {
    return res.status(400).json({ error: "Thiếu thông tin voucher" });
  }

  try {
    // Kiểm tra trùng mã
    const exists = await db.query("SELECT id FROM sales WHERE code = $1", [
      code,
    ]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Mã voucher đã tồn tại" });
    }

    await db.query(
      `INSERT INTO sales (code, discount_type, discount_value, min_order, max_uses, expires_at, created_at, used_count)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), 0)`,
      [code, discount_type, discount_value, min_order, max_uses, expires_at]
    );
    res.json({ message: "Thêm voucher thành công" });
  } catch (err) {
    res.status(500).json({
      error: "Lỗi khi thêm voucher",
      detail: err.message,
    });
  }
});

// Kiểm tra mã giảm giá
router.post("/check-code", async (req, res) => {
  const { code, totalPrice } = req.body;
  try {
    const result = await db.query("SELECT * FROM sales WHERE code = $1", [
      code,
    ]);
    const sale = result.rows[0];

    if (!sale) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }

    const now = new Date();
    if (new Date(sale.expires_at) < now) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
    }

    if (sale.used_count >= sale.max_uses) {
      return res
        .status(400)
        .json({ message: "Mã giảm giá đã đạt giới hạn sử dụng." });
    }

    if (totalPrice < sale.min_order) {
      return res.status(400).json({
        message: `Đơn hàng cần tối thiểu ${sale.min_order}đ để áp dụng mã.`,
      });
    }

    let discountAmount = 0;
    if (sale.discount_type === "percent") {
      discountAmount = (sale.discount_value / 100) * totalPrice;
    } else if (sale.discount_type === "amount") {
      discountAmount = sale.discount_value;
    }

    res.json({
      message: "Áp dụng mã thành công.",
      discount: sale.discount_value,
      discountType: sale.discount_type,
      discountAmount,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// Sửa voucher
router.put("/:id", async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    min_order,
    max_uses,
    expires_at,
  } = req.body;
  const { id } = req.params;

  if (
    !code ||
    !discount_type ||
    !discount_value ||
    !min_order ||
    !max_uses ||
    !expires_at
  ) {
    return res.status(400).json({ error: "Thiếu thông tin voucher" });
  }

  try {
    // Kiểm tra trùng mã (trừ chính voucher đang sửa)
    const exists = await db.query(
      "SELECT id FROM sales WHERE code = $1 AND id != $2",
      [code, id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Mã voucher đã tồn tại" });
    }

    await db.query(
      `UPDATE sales SET code = $1, discount_type = $2, discount_value = $3,
        min_order = $4, max_uses = $5, expires_at = $6 WHERE id = $7`,
      [code, discount_type, discount_value, min_order, max_uses, expires_at, id]
    );
    res.json({ message: "Cập nhật voucher thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật voucher", detail: err.message });
  }
});

// Xóa voucher
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM sales WHERE id = $1", [id]);
    res.json({ message: "Đã xóa voucher" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi xóa voucher", detail: err.message });
  }
});

module.exports = router;
