// const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '', // nếu có mật khẩu thì điền vào đây
//   database: 'be_shop'
// });

// db.connect((err) => {
//   if (err) {
//     console.log("Lỗi kết nối DB:", err);
//     return;
//   }
//   console.log("Kết nối MySQL thành công!");
// });

// module.exports = db;


// const mysql = require('mysql2/promise'); // ✅ Sử dụng Promise API

// const pool = mysql.createPool({
//   host: 'localhost',
//   port: 3307,             
//   user: 'root',
//   password: '2004',       
//   database: 'hnoss_shop', 
// });

// pool.getConnection()
//   .then(() => {
//     console.log('✅ Kết nối MySQL thành công!');
//   })
//   .catch((err) => {
//     console.error('❌ Kết nối MySQL thất bại:', err.message);
//   });

// module.exports = pool;


// const mysql = require('mysql2/promise');
// require('dotenv').config(); // Đọc biến môi trường từ .env

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3307,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '2004',
//   database: process.env.DB_NAME || 'hnoss_shop',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // Kiểm tra kết nối
// pool.getConnection()
//   .then((conn) => {
//     console.log('✅ Kết nối MySQL thành công!');
//     conn.release(); // Trả lại connection về pool
//   })
//   .catch((err) => {
//     console.error('❌ Kết nối MySQL thất bại:', err.message);
//   });

// module.exports = pool;


// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
//   ssl: { rejectUnauthorized: false }, // cần khi dùng Render PostgreSQL
// });

// pool.connect()
//   .then(() => console.log('✅ PostgreSQL connected!'))
//   .catch((err) => console.error('❌ Connection error:', err.message));

// module.exports = pool;



// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   host: process.env.PG_HOST,
//   port: process.env.PG_PORT,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DATABASE,
// });

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// module.exports = pool;




// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
ssl: process.env.DATABASE_URL.includes("render.com")
  ? { rejectUnauthorized: false }
  : false,
});

// Thêm đoạn này để log ra khi kết nối thành công
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected successfully");
});

// Log lỗi nếu kết nối thất bại
pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
});

module.exports = pool;
