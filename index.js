// require("dotenv").config();

// const admin = require("firebase-admin");

// admin.initializeApp({
//   credential: admin.credential.cert({
//     type: "service_account",
//     project_id: process.env.FIREBASE_PROJECT_ID,
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//     private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL,
//     client_id: process.env.FIREBASE_CLIENT_ID,
//     auth_uri: process.env.FIREBASE_AUTH_URI,
//     token_uri: process.env.FIREBASE_TOKEN_URI,
//     auth_provider_x509_cert_url:
//       process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//     client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
//   }),
// });

// module.exports = admin;

// const express = require("express");
// const app = express();

// const userRoute = require("./routes/user.route");

// app.use("/api/users", userRoute);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// require("dotenv").config();
// const express = require("express");
// const app = express();
// const pool = require("./config/db"); // Kết nối PostgreSQL
// const userRoute = require("./routes/user");

// // Middleware
// app.use(express.json());

// // Routes
// app.use("/api/users", userRoute);

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware CORS và JSON
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// Import routes
const productRoutes = require("./routes/product.route");
const categoryRoutes = require("./routes/category.route");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const saleRoutes = require("./routes/sale.route");
const orderRoutes = require("./routes/order.route");
const voucherRoutes = require("./routes/voucher.route");
const uploadRoutes = require("./routes/upload.route");
const bannerRoutes = require("./routes/banner.route");
const dashboardRoutes = require("./routes/dashboard.route");
const contactRoutes = require("./routes/contact.route");

// Routes prefix
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api", uploadRoutes);
app.use("/api", bannerRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/contact", contactRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error("❌ Lỗi:", err.stack);
  res.status(500).json({ message: "Đã xảy ra lỗi máy chủ" });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
