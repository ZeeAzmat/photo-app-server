var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PictureSchema = new Schema({
	name: {type: String, required: true},
	link: {type: String, required: true},
	cloudinaryId: {type: String, required: true},
	user: { type: Schema.ObjectId, ref: "User" },
	// user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

module.exports = mongoose.model("Picture", PictureSchema);