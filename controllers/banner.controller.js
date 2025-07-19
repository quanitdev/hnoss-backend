const db = require("../config/db"); // PostgreSQL pool
const cloudinary = require("../config/cloudinary");

// POST /api/banners
exports.uploadBanner = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file.path;

    // Kiểm tra trùng name
    const check = await db.query("SELECT id FROM banners WHERE name = $1", [name]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: "Tên banner đã tồn tại!" });
    }

    // Lưu vào DB
    const result = await db.query(
      "INSERT INTO banners (name, value, description) VALUES ($1, $2, $3) RETURNING id",
      [name, imageUrl, description]
    );

    res.json({ success: true, id: result.rows[0].id, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
};

// GET /api/banners
exports.getBanners = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM banners ORDER BY updated_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed", message: err.message });
  }
};

// GET /api/banners/:name
exports.getBannerByName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await db.query("SELECT * FROM banners WHERE name = $1", [name]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed", message: err.message });
  }
};

// DELETE /api/banners/:id
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm ảnh từ DB
    const result = await db.query("SELECT value FROM banners WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const imageUrl = result.rows[0].value;
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Xoá khỏi Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Xoá khỏi DB
    await db.query("DELETE FROM banners WHERE id = $1", [id]);

    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", message: err.message });
  }
};

// PUT /api/banners/:id
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    let imageUrl = null;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    // Lấy banner cũ
    const result = await db.query("SELECT value FROM banners WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const oldImageUrl = result.rows[0].value;

    // Nếu có ảnh mới thì xoá ảnh cũ trên Cloudinary
    if (imageUrl && oldImageUrl) {
      const publicId = oldImageUrl.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch {}
    }

    // Cập nhật DB
    if (imageUrl) {
      await db.query(
        "UPDATE banners SET name = $1, description = $2, value = $3, updated_at = NOW() WHERE id = $4",
        [name, description, imageUrl, id]
      );
    } else {
      await db.query(
        "UPDATE banners SET name = $1, description = $2, updated_at = NOW() WHERE id = $3",
        [name, description, id]
      );
    }

    res.json({ success: true, message: "Banner updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};
