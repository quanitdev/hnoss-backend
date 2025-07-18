const db = require('../config/db');

exports.uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file.path; // đường dẫn Cloudinary

    const [result] = await db.execute('INSERT INTO images (image_url) VALUES (?)', [imageUrl]);

    res.json({ success: true, url: imageUrl, insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
