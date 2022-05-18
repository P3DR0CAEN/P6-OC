const multer = require("multer");

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
	"image/png": "png",
};

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "images");
	},
	filename: (req, file, callback) => {
		const name = file.originalname.split(" ").join("_");
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + Date.now() + "." + extension);
	},
});

const fileFilter = function (req, file, cb) {
	// reject a file
	const authorizedMimeTypes = Object.keys(MIME_TYPES);

	if (authorizedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only .jpeg or .png files are accepted"), false);
	}
};

module.exports = multer({ storage: storage, fileFilter: fileFilter }).single(
	"image"
);
