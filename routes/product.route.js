const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadProduct } = require("../middlewares/upload");

// ✅ GET all
router.get("/", async (req, res) => {
  const query = `
    SELECT products.*, categories.name AS category_name 
    FROM products 
    LEFT JOIN categories ON products.category_id = categories.id
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET by ID
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const query = `
    SELECT products.*, categories.name AS category_name 
    FROM products 
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
  `;
  try {
    const [results] = await db.query(query, [productId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE
router.post("/", async (req, res) => {
  const {
    id,
    name,
    price,
    description,
    sort_description,
    img,
    category_id,
    inventory,
  } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({
        error: "Thiếu mã sản phẩm (id)",
        detail: "Trường id là bắt buộc.",
      });
  }
  // Kiểm tra trùng mã sản phẩm
  const [exists] = await db.query("SELECT id FROM products WHERE id = ?", [id]);
  if (exists.length > 0) {
    return res
      .status(400)
      .json({
        error: "Mã sản phẩm đã tồn tại",
        detail: `Mã sản phẩm '${id}' đã tồn tại trong hệ thống.`,
      });
  }
  const query = `
 INSERT INTO products (id, name, price, description, sort_description, img, category_id, inventory)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await db.query(query, [
      id,
      name,
      price,
      description,
      sort_description,
      img,
      category_id,
      inventory,
    ]);
    res.json({
      message: "Thêm sản phẩm thành công",
      productId: id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi thêm sản phẩm", detail: err.message });
  }
});

// Upload ảnh sản phẩm lên Cloudinary
router.post("/upload-image", uploadProduct.single("image"), (req, res) => {
  try {
    const imageUrl = req.file.path;
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// ✅ UPDATE
router.put("/:id", async (req, res) => {
  const productId = req.params.id;
  const {
    name,
    price,
    description,
    sort_description,
    img,
    category_id,
    inventory,
  } = req.body;
  const query = `
    UPDATE products SET name = ?, price = ?, description = ?, sort_description = ?, img = ?, category_id = ?, inventory = ?
    WHERE id = ?
  `;
  try {
    const [result] = await db.query(query, [
      name,
      price,
      description,
      sort_description,
      img,
      category_id,
      inventory,
      productId,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật sản phẩm", detail: err.message });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const [result] = await db.query(`DELETE FROM products WHERE id = ?`, [
      productId,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để xoá" });
    }
    res.json({ message: "Xoá sản phẩm thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi khi xoá sản phẩm", detail: err.message });
  }
});

module.exports = router;
