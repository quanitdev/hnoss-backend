const db = require("../config/db");
const sendMail = require("../utils/sendMail");
const {
  sendOrderSuccessMail,
} = require("../utils/renderHnossOrderSuccessMail");

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

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO orders 
      (user_id, total_quantity, total_price, discount_code, discount_amount, total_pay, shipping_fee, shipping_address, receiver_name, receiver_phone, receiver_email, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    const orderId = result.insertId;

    for (const item of products) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Đặt hàng thành công", orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Lỗi đặt hàng", error: err });
  } finally {
    conn.release();
  }
};

// Danh sách đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
};

// Đơn hàng theo user
exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE user_id = ?", [
      userId,
    ]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đơn hàng người dùng" });
  }
};

// Lấy chi tiết đơn hàng (dùng cho xem hóa đơn)
exports.getOrderById = async (req, res) => {
  const id = req.params.id || req.params.orderId;
  console.log("API /order/:id nhận được id:", id);
  try {
    const [[order]] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    const [items] = await db.query(
      `SELECT oi.*, p.name, p.img
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );
    res.json({ order, items });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy chi tiết đơn hàng" });
  }
};

// Admin cập nhật trạng thái
exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  console.log("==> Nhận yêu cầu cập nhật trạng thái:", orderId, status);
  console.log("==> Trạng thái nhận được:", status);
  try {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);

    if (status === "delivered") {
      try {
        // Lấy thông tin đơn hàng
        const [[order]] = await db.query("SELECT * FROM orders WHERE id = ?", [
          orderId,
        ]);
        if (!order) {
          console.error("Không tìm thấy đơn hàng để gửi mail!");
          return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        // Lấy danh sách sản phẩm trong đơn
        const [products] = await db.query(
          `SELECT oi.*, p.name, p.img
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [orderId]
        );
        console.log(
          "Chuẩn bị gửi mail giao hàng thành công tới:",
          order.receiver_email
        );
        await sendOrderSuccessMail({
          order,
          user: { name: order.receiver_name },
          products,
          to: order.receiver_email,
        });
        console.log("Đã gửi mail giao hàng thành công!");
      } catch (err) {
        console.error("Lỗi gửi mail giao hàng:", err);
      }
    }

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};
