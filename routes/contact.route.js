// const express = require("express");
// const router = express.Router();
// const contactController = require("../controllers/contact.controller");
// const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// // Thêm lại route GET (chỉ admin mới dùng, có thể thêm middleware verifyToken, isAdmin nếu muốn)
// router.get("/", contactController.getAllContacts);

// // Route gửi liên hệ (public)
// router.post("/", contactController.createContact);
// router.put("/:id/status", contactController.updateContactStatus);
// router.post("/reply", contactController.replyContact);

// module.exports = router;


const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// Lấy tất cả liên hệ (chỉ admin)
router.get("/", contactController.getAllContacts);

// Gửi liên hệ (public)
router.post("/", contactController.createContact);

// Cập nhật trạng thái liên hệ
router.put("/:id/status", contactController.updateContactStatus);

// Phản hồi liên hệ
router.post("/reply", contactController.replyContact);

module.exports = router;
