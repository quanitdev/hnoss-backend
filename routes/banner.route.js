// const express = require("express");
// const router = express.Router();
// const {
//   uploadBanner: uploadBannerMiddleware,
// } = require("../middlewares/upload");
// const {
//   uploadBanner,
//   getBanners,
//   getBannerByName,
//   deleteBanner,
//   updateBanner,
// } = require("../controllers/banner.controller");

// router.post("/banners", uploadBannerMiddleware.single("image"), uploadBanner);
// router.put(
//   "/banners/:id",
//   uploadBannerMiddleware.single("image"),
//   updateBanner
// );
// router.get("/banners", getBanners);
// router.get("/banners/:name", getBannerByName);
// router.delete("/banners/:id", deleteBanner);

// module.exports = router;


const db = require("../config/db"); // PostgreSQL pool
const cloudinary = require("../config/cloudinary");

// Thêm banner
const uploadBanner = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file?.path;

    if (!name || !image) {
      return res.status(400).json({ message: "Thiếu tên hoặc hình ảnh." });
    }

    const checkExist = await db.query(
      "SELECT * FROM banners WHERE name = $1",
      [name]
    );
    if (checkExist.rows.length > 0) {
      return res.status(409).json({ message: "Banner đã tồn tại." });
    }

    await db.query(
      "INSERT INTO banners (name, image) VALUES ($1, $2)",
      [name, image]
    );

    res.status(201).json({ message: "Thêm banner thành công!" });
  } catch (err) {
    console.error("Lỗi thêm banner:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Lấy toàn bộ banner
const getBanners = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM banners ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy banner:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Lấy banner theo tên
const getBannerByName = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await db.query(
      "SELECT * FROM banners WHERE name = $1",
      [name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy banner." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Xoá banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const bannerRes = await db.query("SELECT * FROM banners WHERE id = $1", [id]);
    const banner = bannerRes.rows[0];

    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner." });
    }

    // Xoá ảnh trên Cloudinary
    const publicId = banner.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`hnoss/banner/${publicId}`);

    // Xoá DB
    await db.query("DELETE FROM banners WHERE id = $1", [id]);

    res.status(200).json({ message: "Xoá banner thành công!" });
  } catch (err) {
    console.error("Lỗi xoá banner:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Cập nhật banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const image = req.file?.path;

    const oldBannerRes = await db.query("SELECT * FROM banners WHERE id = $1", [id]);
    const oldBanner = oldBannerRes.rows[0];

    if (!oldBanner) {
      return res.status(404).json({ message: "Không tìm thấy banner." });
    }

    // Xoá ảnh cũ nếu có ảnh mới
    if (image) {
      const publicId = oldBanner.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`hnoss/banner/${publicId}`);
    }

    await db.query(
      "UPDATE banners SET name = $1, image = $2 WHERE id = $3",
      [name || oldBanner.name, image || oldBanner.image, id]
    );

    res.status(200).json({ message: "Cập nhật banner thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật banner:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = {
  uploadBanner,
  getBanners,
  getBannerByName,
  deleteBanner,
  updateBanner,
};
