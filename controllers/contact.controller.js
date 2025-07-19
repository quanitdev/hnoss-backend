// const pool = require("../config/db");
// const axios = require("axios");
// // Nếu muốn gửi mail, import sendMail ở đây

// exports.createContact = async (req, res) => {
//   try {
//     const { name, email, phone, message } = req.body;
//     if (!name || !email || !message) {
//       return res
//         .status(400)
//         .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
//     }
//     // Lưu vào MySQL
//     const [result] = await pool.execute(
//       "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
//       [name, email, phone, message]
//     );
//     console.log("Kết quả insert:", result);
//     return res.status(201).json({ message: "Gửi liên hệ thành công!" });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server!", error: error.message });
//   }
// };

// exports.getAllContacts = async (req, res) => {
//   try {
//     const [rows] = await pool.execute(
//       "SELECT * FROM contacts ORDER BY createdAt DESC"
//     );
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server!" });
//   }
// };

// exports.updateContactStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const [result] = await pool.execute(
//       "UPDATE contacts SET status = ? WHERE id = ?",
//       [status, id]
//     );
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Không tìm thấy liên hệ!" });
//     }
//     res.json({ message: "Cập nhật trạng thái thành công!" });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server!" });
//   }
// };

// const sendContactReplyMail = require("../utils/sendContactReplyMail");

// exports.replyContact = async (req, res) => {
//   try {
//     const { id, email, content } = req.body;
//     await sendContactReplyMail({
//       to: email,
//       subject: "Phản hồi liên hệ từ HNOSS",
//       html: `<p>${content}</p>`,
//     });
//     res.json({ message: "Đã gửi phản hồi!" });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi gửi mail!" });
//   }
// };


const pool = require("../config/db");
const sendContactReplyMail = require("../utils/sendContactReplyMail");

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Lưu vào PostgreSQL
    const result = await pool.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, message]
    );

    console.log("Kết quả insert:", result.rows[0]);
    return res.status(201).json({ message: "Gửi liên hệ thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts ORDER BY createdAt DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE contacts SET status = $1 WHERE id = $2",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy liên hệ!" });
    }

    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.replyContact = async (req, res) => {
  try {
    const { id, email, content } = req.body;

    await sendContactReplyMail({
      to: email,
      subject: "Phản hồi liên hệ từ HNOSS",
      html: `<p>${content}</p>`,
    });

    res.json({ message: "Đã gửi phản hồi!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi gửi mail!" });
  }
};
