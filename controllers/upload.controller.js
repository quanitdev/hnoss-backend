const db = require('../config/db'); // Kết nối PostgreSQL (dùng pool hoặc client pg)

exports.uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file.path; // Đường dẫn Cloudinary

    // PostgreSQL dùng $1, $2,... thay vì dấu ?
    const result = await db.query('INSERT INTO images (image_url) VALUES ($1) RETURNING id', [imageUrl]);

    res.json({ success: true, url: imageUrl, insertedId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
