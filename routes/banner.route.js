const express = require("express");
const router = express.Router();
const {
  uploadBanner: uploadBannerMiddleware,
} = require("../middlewares/upload");
const {
  uploadBanner,
  getBanners,
  getBannerByName,
  deleteBanner,
  updateBanner,
} = require("../controllers/banner.controller");

router.post("/banners", uploadBannerMiddleware.single("image"), uploadBanner);
router.put(
  "/banners/:id",
  uploadBannerMiddleware.single("image"),
  updateBanner
);
router.get("/banners", getBanners);
router.get("/banners/:name", getBannerByName);
router.delete("/banners/:id", deleteBanner);

module.exports = router;
