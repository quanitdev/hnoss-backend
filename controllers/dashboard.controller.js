// const Order = require("../models/order.model");
// const Product = require("../models/product.model");

// exports.getDashboardData = async (req, res) => {
//   try {
//     // Lấy tất cả đơn hàng đã hoàn thành
//     const orders = await Order.find({ status: "completed" });

//     // Thống kê tổng doanh thu, tổng sản lượng, tổng đơn hàng
//     let totalRevenue = 0;
//     let totalQuantity = 0;
//     let totalOrders = orders.length;
//     const productCount = {};
//     const monthlyStats = {};

//     orders.forEach((order) => {
//       const month = new Date(order.createdAt).getMonth() + 1;
//       if (!monthlyStats[month]) {
//         monthlyStats[month] = { revenue: 0, quantity: 0 };
//       }
//       monthlyStats[month].revenue += order.totalPrice;
//       order.items.forEach((item) => {
//         monthlyStats[month].quantity += item.quantity;
//         totalQuantity += item.quantity;
//         productCount[item.productId] =
//           (productCount[item.productId] || 0) + item.quantity;
//       });
//       totalRevenue += order.totalPrice;
//     });

//     // Sản phẩm bán chạy nhất
//     let bestSellerId = null;
//     let maxSold = 0;
//     for (const [productId, sold] of Object.entries(productCount)) {
//       if (sold > maxSold) {
//         maxSold = sold;
//         bestSellerId = productId;
//       }
//     }
//     let bestSeller = null;
//     if (bestSellerId) {
//       bestSeller = await Product.findById(bestSellerId);
//     }

//     res.json({
//       totalRevenue,
//       totalQuantity,
//       totalOrders,
//       monthlyStats,
//       bestSeller: bestSeller ? { name: bestSeller.name, sold: maxSold } : null,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// exports.getDashboardData = async (req, res) => {
//   try {
//     const range = req.query.range || "month";
//     const now = new Date();
//     let fromDate = new Date();

//     // Tính khoảng thời gian lọc
//     if (range === "day") {
//       fromDate.setHours(0, 0, 0, 0);
//     } else if (range === "week") {
//       const day = now.getDay() || 7;
//       fromDate.setDate(now.getDate() - day + 1);
//       fromDate.setHours(0, 0, 0, 0);
//     } else {
//       fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
//     }

//     // Lọc đơn hàng hoàn thành trong khoảng thời gian
//     const orders = await Order.find({
//       status: "completed",
//       createdAt: { $gte: fromDate },
//     });

//     let totalRevenue = 0;
//     let totalOrders = orders.length;
//     let totalProductsSold = 0;
//     const revenueChartMap = {};
//     const productCount = {};

//     for (const order of orders) {
//       const orderDate = new Date(order.createdAt);
//       totalRevenue += order.totalPrice;

//       const key =
//         range === "day"
//           ? orderDate.getHours() + "h"
//           : orderDate.toISOString().slice(0, 10); // YYYY-MM-DD

//       revenueChartMap[key] = (revenueChartMap[key] || 0) + order.totalPrice;

//       for (const item of order.items) {
//         totalProductsSold += item.quantity;
//         productCount[item.productId] =
//           (productCount[item.productId] || 0) + item.quantity;
//       }
//     }

//     // Chuyển revenueChart thành mảng
//     const revenueChart = Object.entries(revenueChartMap).map(([date, total]) => ({
//       date,
//       total,
//     }));

//     // Sắp xếp sản phẩm bán chạy
//     const sortedProducts = Object.entries(productCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5); // top 5

//     const topProducts = await Promise.all(
//       sortedProducts.map(async ([productId, sold]) => {
//         const product = await Product.findById(productId);
//         return {
//           id: product._id,
//           name: product.name,
//           image: product.thumbnail,
//           sold,
//         };
//       })
//     );

//     res.json({
//       totalRevenue,
//       totalOrders,
//       totalProductsSold,
//       revenueChart,
//       topProducts,
//     });
//   } catch (err) {
//     console.error("Dashboard error:", err);
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };


const pool = require("../config/db"); // kết nối PostgreSQL qua pg

exports.getDashboardData = async (req, res) => {
  try {
    const range = req.query.range || "month";
    const now = new Date();
    let fromDate = new Date();

    // Tính khoảng thời gian
    if (range === "day") {
      fromDate.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      const day = now.getDay() || 7;
      fromDate.setDate(now.getDate() - day + 1);
      fromDate.setHours(0, 0, 0, 0);
    } else {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const fromDateISO = fromDate.toISOString();

    // Tổng doanh thu, tổng đơn hàng, tổng sản phẩm đã bán
    const revenueRes = await pool.query(
      `
      SELECT 
        SUM(o.total_price) AS total_revenue,
        COUNT(o.id) AS total_orders,
        SUM(oi.quantity) AS total_products_sold
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed' AND o.created_at >= $1
    `,
      [fromDateISO]
    );

    const { total_revenue, total_orders, total_products_sold } = revenueRes.rows[0];

    // Dữ liệu biểu đồ doanh thu theo ngày hoặc giờ
    let chartGroupQuery = range === "day"
      ? `TO_CHAR(o.created_at, 'HH24') AS label`
      : `TO_CHAR(o.created_at, 'YYYY-MM-DD') AS label`;

    const chartRes = await pool.query(
      `
      SELECT ${chartGroupQuery}, SUM(o.total_price) AS total
      FROM orders o
      WHERE o.status = 'completed' AND o.created_at >= $1
      GROUP BY label
      ORDER BY label
    `,
      [fromDateISO]
    );

    const revenueChart = chartRes.rows.map(row => ({
      date: range === "day" ? `${row.label}h` : row.label,
      total: parseFloat(row.total)
    }));

    // Top sản phẩm bán chạy
    const topProductsRes = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.thumbnail AS image,
        SUM(oi.quantity) AS sold
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'completed' AND o.created_at >= $1
      GROUP BY p.id, p.name, p.thumbnail
      ORDER BY sold DESC
      LIMIT 5
    `,
      [fromDateISO]
    );

    const topProducts = topProductsRes.rows;

    res.json({
      totalRevenue: parseFloat(total_revenue || 0),
      totalOrders: parseInt(total_orders || 0),
      totalProductsSold: parseInt(total_products_sold || 0),
      revenueChart,
      topProducts,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
