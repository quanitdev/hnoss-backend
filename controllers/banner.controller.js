const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// POST /api/banners
exports.uploadBanner = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file.path;

    // Kiểm tra trùng name
    const [check] = await db.execute("SELECT id FROM banners WHERE name = ?", [
      name,
    ]);
    if (check.length > 0) {
      return res.status(400).json({ error: "Tên banner đã tồn tại!" });
    }

    // Lưu vào DB
    const [result] = await db.execute(
      "INSERT INTO banners (name, value, description) VALUES (?, ?, ?)",
      [name, imageUrl, description]
    );

    res.json({ success: true, id: result.insertId, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
};

// GET /api/banners
exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM banners ORDER BY updated_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};

// GET /api/banners/:name
exports.getBannerByName = async (req, res) => {
  try {
    const { name } = req.params;
    const [rows] = await db.execute("SELECT * FROM banners WHERE name = ?", [
      name,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed", message: err.message });
  }
};

// DELETE /api/banners/:id
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm ảnh từ DB
    const [rows] = await db.execute("SELECT value FROM banners WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    const imageUrl = rows[0].value;
    const publicId = imageUrl.split("/").pop().split(".")[0];

    // Xoá khỏi Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Xoá khỏi DB
    await db.execute("DELETE FROM banners WHERE id = ?", [id]);

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
    const [oldRows] = await db.execute(
      "SELECT value FROM banners WHERE id = ?",
      [id]
    );
    if (oldRows.length === 0)
      return res.status(404).json({ error: "Not found" });
    const oldImageUrl = oldRows[0].value;

    // Nếu có ảnh mới thì xoá ảnh cũ trên Cloudinary
    if (imageUrl && oldImageUrl) {
      const publicId = oldImageUrl.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch {}
    }

    // Cập nhật DB
    const updateQuery = imageUrl
      ? "UPDATE banners SET name = ?, description = ?, value = ?, updated_at = NOW() WHERE id = ?"
      : "UPDATE banners SET name = ?, description = ?, updated_at = NOW() WHERE id = ?";
    const params = imageUrl
      ? [name, description, imageUrl, id]
      : [name, description, id];
    await db.execute(updateQuery, params);

    res.json({ success: true, message: "Banner updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};
