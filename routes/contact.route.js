const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// Thêm lại route GET (chỉ admin mới dùng, có thể thêm middleware verifyToken, isAdmin nếu muốn)
router.get("/", contactController.getAllContacts);

// Route gửi liên hệ (public)
router.post("/", contactController.createContact);
router.put("/:id/status", contactController.updateContactStatus);
router.post("/reply", contactController.replyContact);

module.exports = router;
