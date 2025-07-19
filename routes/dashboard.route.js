// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");

// // GET /api/admin/dashboard-stats?range=day|week|month
// router.get("/dashboard-stats", async (req, res) => {
//   const { range = "month" } = req.query;
//   let dateCondition = "";
//   if (range === "day") {
//     dateCondition = "AND DATE(o.created_at) = CURDATE()";
//   } else if (range === "week") {
//     dateCondition = "AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)";
//   } else {
//     dateCondition =
//       "AND MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())";
//   }

//   try {
//     // Tổng doanh thu (chỉ tính đơn đã giao thành công)
//     const [[{ totalRevenue = 0 }]] = await db.query(
//       `SELECT IFNULL(SUM(o.total_pay),0) as totalRevenue FROM orders o WHERE o.status = 'delivered' ${dateCondition}`
//     );
//     // Doanh thu hôm nay
//     const [[{ todayRevenue = 0 }]] = await db.query(
//       `SELECT IFNULL(SUM(o.total_pay),0) as todayRevenue FROM orders o WHERE o.status = 'delivered' AND DATE(o.created_at) = CURDATE()`
//     );
//     // Tổng đơn hàng đã giao thành công
//     const [[{ totalOrders = 0 }]] = await db.query(
//       `SELECT COUNT(*) as totalOrders FROM orders o WHERE o.status = 'delivered' ${dateCondition}`
//     );
//     // Tổng sản phẩm đã bán
//     const [[{ totalProductsSold = 0 }]] = await db.query(
//       `SELECT IFNULL(SUM(oi.quantity),0) as totalProductsSold FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'delivered' ${dateCondition}`
//     );
//     // Tổng số khách hàng
//     const [[{ totalCustomers = 0 }]] = await db.query(
//       `SELECT COUNT(DISTINCT o.user_id) as totalCustomers FROM orders o WHERE o.status = 'delivered'`
//     );
//     // Tổng số sản phẩm
//     const [[{ totalProducts = 0 }]] = await db.query(
//       `SELECT COUNT(*) as totalProducts FROM products`
//     );

//     // Thống kê đơn hàng theo trạng thái trong tháng hiện tại
//     const [[orderStats]] = await db.query(`
//       SELECT
//         COUNT(*) as total,
//         SUM(status = 'pending') as pending,
//         SUM(status = 'processing') as processing,
//         SUM(status = 'shipped') as shipped,
//         SUM(status = 'delivered') as delivered,
//         SUM(status = 'cancelled') as cancelled
//       FROM orders
//       WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
//     `);

//     // Biểu đồ doanh thu: đủ ngày trong tháng/tuần/giờ trong ngày
//     let revenueChart = [];
//     if (range === "month") {
//       const [chartData] = await db.query(`
//         WITH RECURSIVE dates AS (
//           SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS d
//           UNION ALL
//           SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dates
//           WHERE DATE_ADD(d, INTERVAL 1 DAY) <= LAST_DAY(CURDATE())
//         )
//         SELECT 
//           d AS label, 
//           IFNULL(SUM(o.total_pay), 0) AS total
//         FROM dates
//         LEFT JOIN orders o ON DATE(o.created_at) = d AND o.status = 'delivered'
//         GROUP BY d
//         ORDER BY d
//       `);
//       revenueChart = chartData;
//     } else if (range === "week") {
//       // Trả về đủ 7 ngày trong tuần hiện tại
//       const [chartData] = await db.query(`
//         WITH RECURSIVE dates AS (
//           SELECT DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AS d
//           UNION ALL
//           SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dates
//           WHERE DATE_ADD(d, INTERVAL 1 DAY) <= CURDATE()
//         )
//         SELECT 
//           d AS label, 
//           IFNULL(SUM(o.total_pay), 0) AS total
//         FROM dates
//         LEFT JOIN orders o ON DATE(o.created_at) = d AND o.status = 'delivered'
//         GROUP BY d
//         ORDER BY d
//       `);
//       revenueChart = chartData;
//     } else if (range === "day") {
//       // Trả về đủ 24 giờ trong ngày
//       const [chartData] = await db.query(`
//         SELECT 
//           h AS label,
//           IFNULL(SUM(o.total_pay), 0) AS total
//         FROM (
//           SELECT 0 AS h UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
//           SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
//           SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
//           SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
//           SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
//           SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23
//         ) hours
//         LEFT JOIN orders o ON HOUR(o.created_at) = hours.h AND o.status = 'delivered' AND DATE(o.created_at) = CURDATE()
//         GROUP BY h
//         ORDER BY h
//       `);
//       revenueChart = chartData;
//     }

//     // // Top sản phẩm bán chạy
//     // const [topProducts] = await db.query(
//     //   `SELECT p.id, p.name, p.img as image, IFNULL(SUM(oi.quantity),0) as sold, p.inventory FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id WHERE o.status = 'delivered' ${dateCondition} GROUP BY p.id, p.name, p.img ORDER BY sold DESC LIMIT 5`
//     // );
//     // Top sản phẩm bán chạy
// const [topProducts] = await db.query(
//   `SELECT 
//       p.id, 
//       p.name, 
//       p.img as image, 
//       IFNULL(SUM(oi.quantity), 0) as sold, 
//       p.inventory 
//    FROM order_items oi 
//    JOIN products p ON oi.product_id = p.id 
//    JOIN orders o ON oi.order_id = o.id 
//    WHERE o.status = 'delivered' ${dateCondition} 
//    GROUP BY p.id, p.name, p.img, p.inventory 
//    ORDER BY sold DESC 
//    LIMIT 5`
// );


//     res.json({
//       totalRevenue: Number(totalRevenue),
//       todayRevenue: Number(todayRevenue),
//       totalOrders: Number(totalOrders),
//       totalProductsSold: Number(totalProductsSold),
//       totalCustomers: Number(totalCustomers),
//       totalProducts: Number(totalProducts),
//       orderStats,
//       revenueChart,
//       topProducts,
//     });
//   } catch (err) {
//     console.error("❌ Lỗi dashboard-stats:", err);
//     res.status(500).json({
//       message: "Lỗi lấy thống kê dashboard",
//       error: err.message,
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// GET /api/admin/dashboard-stats?range=day|week|month
router.get("/dashboard-stats", verifyToken, isAdmin, async (req, res) => {
  const { range = "month" } = req.query;
  let dateCondition = "";

  switch (range) {
    case "day":
      dateCondition = "AND DATE(o.created_at) = CURDATE()";
      break;
    case "week":
      dateCondition = "AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)";
      break;
    default:
      dateCondition = "AND MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())";
  }

  try {
    const [[{ totalRevenue = 0 }]] = await db.query(
      `SELECT IFNULL(SUM(o.total_pay),0) as totalRevenue FROM orders o WHERE o.status = 'delivered' ${dateCondition}`
    );

    const [[{ todayRevenue = 0 }]] = await db.query(
      `SELECT IFNULL(SUM(o.total_pay),0) as todayRevenue FROM orders o WHERE o.status = 'delivered' AND DATE(o.created_at) = CURDATE()`
    );

    const [[{ totalOrders = 0 }]] = await db.query(
      `SELECT COUNT(*) as totalOrders FROM orders o WHERE o.status = 'delivered' ${dateCondition}`
    );

    const [[{ totalProductsSold = 0 }]] = await db.query(
      `SELECT IFNULL(SUM(oi.quantity),0) as totalProductsSold FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'delivered' ${dateCondition}`
    );

    const [[{ totalCustomers = 0 }]] = await db.query(
      `SELECT COUNT(DISTINCT o.user_id) as totalCustomers FROM orders o WHERE o.status = 'delivered'`
    );

    const [[{ totalProducts = 0 }]] = await db.query(
      `SELECT COUNT(*) as totalProducts FROM products`
    );

    const [[orderStats]] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'processing') as processing,
        SUM(status = 'shipped') as shipped,
        SUM(status = 'delivered') as delivered,
        SUM(status = 'cancelled') as cancelled
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
    `);

    let revenueChart = [];

    if (range === "month") {
      const [data] = await db.query(`
        WITH RECURSIVE dates AS (
          SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS d
          UNION ALL
          SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dates
          WHERE DATE_ADD(d, INTERVAL 1 DAY) <= LAST_DAY(CURDATE())
        )
        SELECT d AS label, IFNULL(SUM(o.total_pay), 0) AS total
        FROM dates
        LEFT JOIN orders o ON DATE(o.created_at) = d AND o.status = 'delivered'
        GROUP BY d
        ORDER BY d
      `);
      revenueChart = data;
    } else if (range === "week") {
      const [data] = await db.query(`
        WITH RECURSIVE dates AS (
          SELECT DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AS d
          UNION ALL
          SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dates
          WHERE DATE_ADD(d, INTERVAL 1 DAY) <= CURDATE()
        )
        SELECT d AS label, IFNULL(SUM(o.total_pay), 0) AS total
        FROM dates
        LEFT JOIN orders o ON DATE(o.created_at) = d AND o.status = 'delivered'
        GROUP BY d
        ORDER BY d
      `);
      revenueChart = data;
    } else if (range === "day") {
      const [data] = await db.query(`
        SELECT 
          h AS label,
          IFNULL(SUM(o.total_pay), 0) AS total
        FROM (
          SELECT 0 AS h UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
          SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL
          SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
          SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
          SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
          SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23
        ) hours
        LEFT JOIN orders o ON HOUR(o.created_at) = hours.h AND o.status = 'delivered' AND DATE(o.created_at) = CURDATE()
        GROUP BY h
        ORDER BY h
      `);
      revenueChart = data;
    }

    const [topProducts] = await db.query(`
      SELECT 
        p.id, p.name, p.img as image,
        IFNULL(SUM(oi.quantity), 0) as sold,
        p.inventory
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered' ${dateCondition}
      GROUP BY p.id, p.name, p.img, p.inventory
      ORDER BY sold DESC
      LIMIT 5
    `);

    res.json({
      totalRevenue: Number(totalRevenue),
      todayRevenue: Number(todayRevenue),
      totalOrders: Number(totalOrders),
      totalProductsSold: Number(totalProductsSold),
      totalCustomers: Number(totalCustomers),
      totalProducts: Number(totalProducts),
      orderStats,
      revenueChart,
      topProducts,
    });
  } catch (err) {
    console.error("❌ Lỗi dashboard-stats:", err);
    res.status(500).json({ message: "Lỗi lấy thống kê dashboard", error: err.message });
  }
});

module.exports = router;
