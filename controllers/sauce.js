const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.list = (req, res, next) => {
	Sauce.find()
		.then((things) => res.status(200).json(things))
		.catch((error) => res.status(400).json({ error }));
};

exports.addSauce = (req, res, next) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	const sauce = new Sauce({
		...sauceObject,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		dislikes: "0",
		likes: "0",
	});
	sauce
		.save()
		.then(() => res.status(201).json({ message: "Objet enregistré !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.viewSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((things) => res.status(200).json(things))
		.catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = async (req, res, next) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	const query = {
		_id: req.params.id,
		userId: req.userId,
	};
	const newDatas = {
		...sauceObject,
		_id: req.params.id,
	};

	try {
		const updateRes = await Sauce.updateOne(query, newDatas);
		if (updateRes.modifiedCount == 0) {
			return res.status(400).json({ message: "Objet non modifié" });
		}
		return res.status(200).json({ message: "Objet modifié !" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

exports.deleteSauce = async (req, res, next) => {
	const query = {
		_id: req.params.id,
		userId: req.userId,
	};

	const sauce = await Sauce.findOne(query);

	if (sauce == null) {
		return res.status(400).json({ message: "Objet non trouvé" });
	}

	try {
		const filename = sauce.imageUrl.split("/images/")[1];

		fs.unlinkSync(`images/${filename}`);

		await Sauce.deleteOne({ _id: req.params.id });

		return res.status(200).json({ message: "Objet supprimé !" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

exports.likeSauce = async (req, res, next) => {
	const query = { _id: req.params.id };

	const sauce = await Sauce.findOne(query);

	let likesList = sauce.usersLiked;
	let dislikesList = sauce.usersDisliked;
	let nbLike = likesList.length;
	let nbDislike = dislikesList.length;
	const userId = req.userId;

	// si y'a déjà un like ou dislike on l'enlève = l'utilisateur retire son like
	if (likesList.includes(userId)) {
		likesList = likesList.filter((item) => item !== userId);
		nbLike = likesList.length;
	}
	if (dislikesList.includes(userId)) {
		dislikesList = dislikesList.filter((item) => item !== userId);
		nbDislike = dislikesList.length;
	}

	// si l'utilisateur ajoute un like ou dislike
	if (req.body.like == 1) {
		likesList.push(req.body.userId);
		nbLike = likesList.length;
	}
	if (req.body.like == -1) {
		dislikesList.push(req.body.userId);
		nbDislike = dislikesList.length;
	}

	const newDatas = {
		likes: nbLike,
		dislikes: nbDislike,
		usersLiked: likesList,
		usersDisliked: dislikesList,
	};

	try {
		const updateRes = await Sauce.updateOne(query, newDatas);

		if (updateRes.modifiedCount == 0) {
			return res.status(400).json({ message: "Objet non modifié" });
		}

		return res.status(200).json({ message: "Objet modifié !" });
	} catch (error) {
		return res.status(500).json({ error });
	}
};
