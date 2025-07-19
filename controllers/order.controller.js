const pool = require("../config/db"); // PostgreSQL pool
const sendMail = require("../utils/sendMail");
const { sendOrderSuccessMail } = require("../utils/renderHnossOrderSuccessMail");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  const {
    user_id,
    products,
    totalQuantity,
    totalPrice,
    discountCode,
    discountAmount,
    totalPay,
    shippingFee,
    shippingAddress,
    receiverName,
    receiverPhone,
    receiverEmail,
    note,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertOrderQuery = `
      INSERT INTO orders (
        user_id, total_quantity, total_price, discount_code, discount_amount,
        total_pay, shipping_fee, shipping_address, receiver_name, receiver_phone,
        receiver_email, note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id
    `;

    const insertOrderValues = [
      user_id,
      totalQuantity,
      totalPrice,
      discountCode,
      discountAmount,
      totalPay,
      shippingFee,
      shippingAddress,
      receiverName,
      receiverPhone,
      receiverEmail,
      note,
    ];

    const result = await client.query(insertOrderQuery, insertOrderValues);
    const orderId = result.rows[0].id;

    for (const item of products) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Đặt hàng thành công", orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Lỗi đặt hàng", error: err.message });
  } finally {
    client.release();
  }
};

// Danh sách đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
};

// Đơn hàng theo user
exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
      userId,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn hàng người dùng" });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
  const id = req.params.id || req.params.orderId;

  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ]);
    const order = orderResult.rows[0];
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.img
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({ order, items: itemsResult.rows });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đơn hàng" });
  }
};

// Admin cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [
      status,
      orderId,
    ]);

    if (status === "delivered") {
      try {
        const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [
          orderId,
        ]);
        const order = orderRes.rows[0];
        if (!order) {
          return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const productsRes = await pool.query(
          `SELECT oi.*, p.name, p.img
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [orderId]
        );

        await sendOrderSuccessMail({
          order,
          user: { name: order.receiver_name },
          products: productsRes.rows,
          to: order.receiver_email,
        });
      } catch (err) {
        console.error("Lỗi gửi mail giao hàng:", err);
      }
    }

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};
