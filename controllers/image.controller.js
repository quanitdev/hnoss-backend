const cloudinary = require('../config/cloudinary');
const pool = require('../config/db'); // config dùng pg.Pool

exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy image_url từ PostgreSQL
    const result = await pool.query('SELECT image_url FROM images WHERE id = $1', [id]);
    const image = result.rows[0];
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Lấy public_id từ image_url
    const parts = image.image_url.split('/');
    const public_id_with_ext = parts[parts.length - 1];
    const public_id = 'hnoss/' + public_id_with_ext.split('.')[0];

    // Xoá trên Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Xoá bản ghi trong PostgreSQL
    await pool.query('DELETE FROM images WHERE id = $1', [id]);

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
