const express = require("express");
const router = express.Router();

const asyncHandler = require("express-async-handler");

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

const multerMiddleware = function (req, res, next) {
	multer(req, res, function (err) {
		if (err) {
			return res.status(500).json("Veuillez upload un fichier image");
		}
		// Everything went fine.
		return next();
	});
};

router.get("/", auth, sauceCtrl.list);
router.post("/", auth, multerMiddleware, sauceCtrl.addSauce);
router.get("/:id", auth, sauceCtrl.viewSauce);
router.put("/:id", auth, multerMiddleware, asyncHandler(sauceCtrl.modifySauce));
router.delete("/:id", auth, asyncHandler(sauceCtrl.deleteSauce));
router.post("/:id/like", auth, asyncHandler(sauceCtrl.likeSauce));

module.exports = router;
