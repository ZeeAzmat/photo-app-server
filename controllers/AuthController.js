const UserModel = require("../models/UserModel");
const { query, body, validationResult, sanitizeBody } = require("express-validator");

//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),

	// Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),

	// Process request after validation and sanitization.
	(req, res) => {
		try {
			console.log('req.body: ', req.body);
			console.log('req.query: ', req.query);
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			console.log('errors: ', errors);

			if (!errors.isEmpty()) {
				console.log("errors: ", errors.array());
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				const { body } = req;
				//hash input password
				bcrypt.hash(body.password, 10, function(err, hash) {
					// Create User object with escaped and trimmed data
					const user = new UserModel(
						{
							password: hash,
							email: body.email,
							lastName: body.lastName,
							firstName: body.firstName,
						}
					);

					user.save(function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}

						const userData = {
							_id: user._id,
							email: user.email,
							lastName: user.lastName,
							firstName: user.firstName,
						};

						return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					});
				});
			}
		} catch (err) {
			console.log("err: ", err);
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				const { body } = req;
				console.log('body.email: ', body);
				UserModel.findOne({email : body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(body.password, user.password, function (err, same) {
							if (same) {
								let userData = {
									_id: user._id,
									email: user.email,
									lastName: user.lastName,
									firstName: user.firstName,
								};

								//Prepare JWT token for authentication
								const jwtPayload = userData;
								const jwtData = {
									expiresIn: process.env.JWT_TIMEOUT_DURATION,
								};

								const secret = process.env.JWT_SECRET;
								//Generated JWT token with Payload and secret.
								userData.token = jwt.sign(jwtPayload, secret, jwtData);

								return apiResponse.successResponseWithData(res,"Login Success.", userData);
							} else {
								return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
							}
						});
					} else {
						return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];
