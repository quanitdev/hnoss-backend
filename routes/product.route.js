const express = require("express");
const router = express.Router();
const db = require("../config/db"); // PostgreSQL pool
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadProduct } = require("../middlewares/upload");

// ✅ GET all products
router.get("/", async (req, res) => {
  const query = `
    SELECT products.*, categories.name AS category_name 
    FROM products 
    LEFT JOIN categories ON products.category_id = categories.id
  `;
  try {
    const results = await db.query(query);
    res.json(results.rows);
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
    WHERE products.id = $1
  `;
  try {
    const results = await db.query(query, [productId]);
    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(results.rows[0]);
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
    return res.status(400).json({
      error: "Thiếu mã sản phẩm (id)",
      detail: "Trường id là bắt buộc.",
    });
  }

  try {
    const exists = await db.query("SELECT id FROM products WHERE id = $1", [id]);
    if (exists.rows.length > 0) {
      return res.status(400).json({
        error: "Mã sản phẩm đã tồn tại",
        detail: `Mã sản phẩm '${id}' đã tồn tại trong hệ thống.`,
      });
    }

    const query = `
      INSERT INTO products (id, name, price, description, sort_description, img, category_id, inventory)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await db.query(query, [
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
    res.status(500).json({ error: "Lỗi khi thêm sản phẩm", detail: err.message });
  }
});

// ✅ Upload ảnh
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
    UPDATE products
    SET name = $1, price = $2, description = $3, sort_description = $4,
        img = $5, category_id = $6, inventory = $7
    WHERE id = $8
  `;

  try {
    const result = await db.query(query, [
      name,
      price,
      description,
      sort_description,
      img,
      category_id,
      inventory,
      productId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm", detail: err.message });
  }
});

// ✅ DELETE
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const result = await db.query("DELETE FROM products WHERE id = $1", [productId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để xoá" });
    }

    res.json({ message: "Xoá sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xoá sản phẩm", detail: err.message });
  }
});

module.exports = router;
