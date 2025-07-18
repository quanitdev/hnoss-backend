const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Storage cho banner
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hnoss/banner",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Storage cho product
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hnoss/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const uploadBanner = multer({ storage: bannerStorage });
const uploadProduct = multer({ storage: productStorage });

module.exports = {
  uploadBanner,
  uploadProduct,
};
