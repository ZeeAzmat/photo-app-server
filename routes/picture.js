var express = require("express");
const PictureController = require("../controllers/PictureController");

var router = express.Router();

router.get("/", PictureController.pictureList);
router.get("/:id", PictureController.pictureDetail);
router.post("/", PictureController.pictureStore);
router.put("/:id", PictureController.pictureUpdate);
router.delete("/:id", PictureController.pictureDelete);

module.exports = router;
