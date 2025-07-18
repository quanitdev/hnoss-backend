const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Middleware xử lý
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Import các route
const productRoutes = require("./routes/product.route");
const categoryRoutes = require("./routes/category.route");
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const saleRoute = require("./routes/sale.route");
const orderRoute = require("./routes/order.route");
const voucherRouter = require("./routes/voucher.route");
const uploadRoute = require("./routes/upload.route");
const bannerRoute = require("./routes/banner.route");
const dashboardRouter = require("./routes/dashboard.route");
const contactRoute = require("./routes/contact.route");

// Sử dụng các route
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/sale", saleRoute);
app.use("/api/orders", orderRoute);
app.use("/api/vouchers", voucherRouter);
app.use("/api", uploadRoute);
app.use("/api", bannerRoute);
app.use("/api/admin", dashboardRouter);
app.use("/api/contact", contactRoute);

// Middleware xử lý lỗi chung (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
