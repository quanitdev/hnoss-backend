// // const jwt = require("jsonwebtoken");

// // const verifyToken = (req, res, next) => {
// //   const authHeader = req.headers.authorization;

// //   // Kiểm tra có token không
// //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //     return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
// //   }

// //   const token = authHeader.split(" ")[1];

// //   try {
// //     const decoded = jwt.verify(token, "SECRET_KEY"); // Giải mã token
// //     req.user = decoded; // Gắn thông tin user vào req để dùng sau
// //     next(); // Cho phép đi tiếp middleware tiếp theo
// //   } catch (err) {
// //     return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
// //   }
// // };

// // module.exports = {
// //   verifyToken,
// //   isAdmin: (req, res, next) => {
// //     if (req.user?.role !== "admin") {
// //       return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
// //     }
// //     next();
// //   },
// // };

// const jwt = require("jsonwebtoken");

// // Middleware kiểm tra token hợp lệ
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Không có token hoặc token không hợp lệ" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, "SECRET_KEY"); // giải mã token
//     req.user = decoded; // gán thông tin người dùng vào request
//     next(); // cho phép middleware tiếp theo
//   } catch (err) {
//     return res
//       .status(403)
//       .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
//   }
// };

// // Middleware kiểm tra quyền admin
// const isAdmin = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
//   }
//   next(); // tiếp tục nếu là admin
// };

// module.exports = {
//   verifyToken,
//   isAdmin,
// };

// const jwt = require("jsonwebtoken");

// // Middleware kiểm tra token hợp lệ
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "❌ Không có token hoặc định dạng token không đúng." });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Lấy từ biến môi trường
//     req.user = decoded; // Gán user info vào request
//     next();
//   } catch (err) {
//     return res
//       .status(403)
//       .json({ message: "❌ Token không hợp lệ hoặc đã hết hạn." });
//   }
// };

// // Middleware kiểm tra quyền admin
// const isAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res
//       .status(403)
//       .json({ message: "🚫 Bạn không có quyền truy cập vào chức năng này!" });
//   }
//   next();
// };

// module.exports = {
//   verifyToken,
//   isAdmin,
// };

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "❌ Không có token hoặc định dạng token không đúng." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // dùng biến môi trường
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "❌ Token không hợp lệ hoặc đã hết hạn." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Bạn không có quyền truy cập!" });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
