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

exports.modifySauce = (req, res, next) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	Sauce.updateOne(
		{ _id: req.params.id },
		{ ...sauceObject, _id: req.params.id }
	)
		.then(() => res.status(200).json({ message: "Objet modifié !" }))
		.catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			const filename = sauce.imageUrl.split("/images/")[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: req.params.id })
					.then(() =>
						res.status(200).json({ message: "Objet supprimé !" })
					)
					.catch((error) => res.status(400).json({ error }));
			});
		})
		.catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
	if (req.body.like == 1) {
		Sauce.updateOne(
			{ _id: req.params.id },
			{
				$push: {
					usersLiked: req.body.userId,
				},
				$pull: {
					usersDisliked: req.body.userId,
				},
			}
		)
			.then(() => res.status(200).json({ message: "Like Ajouté !" }))
			.catch((error) => res.status(400).json({ error }));
	} else if (req.body.like == -1) {
		Sauce.updateOne(
			{ _id: req.params.id },
			{
				$push: {
					usersDisliked: req.body.userId,
				},
				$pull: {
					usersLiked: req.body.userId,
				},
			}
		)
			.then(() => res.status(200).json({ message: "Like Ajouté !" }))
			.catch((error) => res.status(400).json({ error }));
	} else {
		Sauce.updateOne(
			{ _id: req.params.id },
			{
				$pull: {
					usersLiked: req.body.userId,
					usersDisliked: req.body.userId,
				},
			}
		)
			.then(() => res.status(200).json({ message: "Like Ajouté !" }))
			.catch((error) => res.status(400).json({ error }));
	}

	/* ----------- */

	Sauce.aggregate([
		{ $match: { _id: req.params.id } },
		{ $project: { usersLiked: { $size: "$usersLiked" } } },
	]).exec(function (e, d) {
		console.log(e, d);
	});
};
