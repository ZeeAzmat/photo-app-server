const Picture = require("../models/PictureModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Picture Schema
function PictureData(data) {
	this.id = data._id;
	this.name= data.name;
	this.link = data.link;
	this.createdAt = data.createdAt;
	this.cloudinaryId = data.cloudinaryId;
}

/**
 * Picture List.
 *
 * @returns {Object}
 */
exports.pictureList = [
	auth,
	function (req, res) {
		try {
			Picture.find({user: req.user._id},"_id title description isbn createdAt").then((pictures)=>{
				if(pictures.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", pictures);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * picture Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.pictureDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Picture.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((picture)=>{
				if(picture !== null){
					let pictureData = new PictureData(picture);
					return apiResponse.successResponseWithData(res, "Operation success", pictureData);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * picture store.
 *
 * @param {string}      name
 * @param {string}      link
 * @param {string}      cloudinaryId
 *
 * @returns {Object}
 */
exports.pictureStore = [
	auth,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	body("link", "Link must not be empty.").isLength({ min: 1 }).trim(),
	body("cloudinaryId", "Cloudinary Id must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Picture.findOne({cloudinaryId: value, user: req.user._id}).then(picture => {
			if (picture) {
				return Promise.reject("Picture already exist with this cloudinary Id.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var picture = new Picture(
				{
					user: req.user,
					name: req.body.name,
					link: req.body.link,
					cloudinaryId: req.body.cloudinaryId
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//Save picture.
				picture.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let pictureData = new PictureData(picture);
					return apiResponse.successResponseWithData(res,"Picture add Success.", pictureData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Picture update.
 *
 * @param {string}      name
 * @param {string}      link
 * @param {string}      cloudinaryId
 *
 * @returns {Object}
 */
exports.pictureUpdate = [
	auth,
	body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
	body("link", "link must not be empty.").isLength({ min: 1 }).trim(),
	body("cloudinaryId", "cloudinaryId must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Picture.findOne({cloudinaryId: value, user: req.user._id, _id: { "$ne": req.params.id }}).then(picture => {
			if (picture) {
				return Promise.reject("Picture already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var picture = new Picture(
				{
					_id: req.params.id,
					name: req.body.name,
					link: req.body.link,
					cloudinaryId: req.body.cloudinaryId,
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					Picture.findById(req.params.id, function (err, foundPicture) {
						if(foundPicture === null){
							return apiResponse.notFoundResponse(res,"Picture not exists with this id");
						}else{
							//Check authorized user
							if(foundPicture.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else {
								//update picture.
								Picture.findByIdAndUpdate(req.params.id, picture, {},function (err) {
									if (err) {
										return apiResponse.ErrorResponse(res, err);
									} else {
										let pictureData = new PictureData(picture);
										return apiResponse.successResponseWithData(res,"Picture update Success.", pictureData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Picture Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.pictureDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Picture.findById(req.params.id, function (err, foundPicture) {
				if(foundPicture === null){
					return apiResponse.notFoundResponse(res,"Picture not exists with this id");
				}else{
					//Check authorized user
					if(foundPicture.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete picture.
						Picture.findByIdAndRemove(req.params.id,function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							}else{
								return apiResponse.successResponse(res, "Picture delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];