const express = require("express");
const router = express.Router();
const db = require("../config/db");
const moment = require("moment");
const orderController = require("../controllers/order.controller");

// ✅ API: Tạo đơn hàng
router.post("/create", async (req, res) => {
  console.log("Payload nhận được:", req.body);

  const {
    user_id,
    products,
    totalQuantity,
    totalPrice,
    discountCode,
    discountAmount,
    totalPay,
    shippingFee,
    note = "",
    receiver_name,
    receiver_phone,
    receiver_email,
    shipping_address,
    payment_method,
  } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: "Chưa đăng nhập." });
  }

  if (!products || products.length === 0) {
    return res
      .status(400)
      .json({ message: "Không có sản phẩm nào trong đơn hàng." });
  }

  if (!receiver_name || !receiver_phone || !shipping_address) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin giao hàng." });
  }

  if (!["cod", "bank"].includes(payment_method)) {
    return res
      .status(400)
      .json({ message: "Vui lòng chọn phương thức thanh toán hợp lệ." });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Kiểm tra tồn kho
    for (const item of products) {
      const [rows] = await connection.execute(
        `SELECT inventory FROM products WHERE id = ?`,
        [item.product_id]
      );
      if (!rows.length || rows[0].inventory < item.quantity) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ message: `Sản phẩm ID ${item.product_id} không đủ hàng.` });
      }
    }

    // Tạo đơn hàng
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
          user_id, total_quantity, total_price,
          discount_code, discount_amount, total_pay,
          shipping_fee, shipping_address,
          receiver_name, receiver_phone, receiver_email,
          note, payment_method, status, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        user_id,
        totalQuantity,
        totalPrice,
        discountCode || null,
        discountAmount || 0,
        totalPay,
        shippingFee || 0,
        shipping_address,
        receiver_name,
        receiver_phone,
        receiver_email || "",
        note,
        payment_method,
        moment().format("YYYY-MM-DD HH:mm:ss"),
      ]
    );

    const orderId = orderResult.insertId;

    // Chi tiết sản phẩm
    for (const item of products) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
      await connection.execute(
        `UPDATE products SET inventory = inventory - ? WHERE id = ? AND inventory >= ?`,
        [item.quantity, item.product_id, item.quantity]
      );
    }

    // Cập nhật mã giảm giá
    if (discountCode) {
      await connection.execute(
        `UPDATE sales SET used_count = used_count + 1 WHERE code = ?`,
        [discountCode]
      );
    }

    await connection.commit();
    connection.release();
    res.json({ message: "Đặt hàng thành công!", orderId });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Lỗi đặt hàng:", err);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng." });
  }
});

// ✅ API: Lấy đơn hàng theo user
router.get("/user/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [orders] = await db.execute(
      `SELECT id, total_pay, status, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [user_id]
    );

    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng." });
  }
});

// ✅ API: Admin lấy tất cả đơn hàng
router.get("/", async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT id, user_id, receiver_name, shipping_address, total_pay, status FROM orders ORDER BY created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng." });
  }
});

// ✅ API: Admin cập nhật trạng thái đơn hàng
router.put("/update-status/:id", orderController.updateOrderStatus);

// ✅ API: Lấy đơn hàng theo id
router.get("/:id", orderController.getOrderById);

module.exports = router;
