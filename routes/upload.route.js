const express = require("express");
const router = express.Router();
const { uploadBanner, uploadProduct } = require("../middlewares/upload");
const db = require("../config/db");
const { deleteImage } = require("../controllers/image.controller");

router.delete("/image/:id", deleteImage);
// POST /api/upload-image
router.post("/upload-image", uploadBanner.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;
    const [result] = await db.execute(
      "INSERT INTO images (image_url) VALUES (?)",
      [imageUrl]
    );
    res.json({ success: true, imageUrl, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
