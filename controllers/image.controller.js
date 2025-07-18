const cloudinary = require('../config/cloudinary');
const db = require('../config/db');

exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy image_url từ DB
    const [[image]] = await db.query('SELECT image_url FROM images WHERE id = ?', [id]);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Lấy public_id từ image_url
    const parts = image.image_url.split('/');
    const public_id_with_ext = parts[parts.length - 1];
    const public_id = 'hnoss/' + public_id_with_ext.split('.')[0];

    // Xoá trên Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Xoá trong DB
    await db.query('DELETE FROM images WHERE id = ?', [id]);

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
