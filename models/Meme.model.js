const { Schema, model } = require('mongoose');
const User = require("../models/User.model")

const memeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
    width: {
		type: Number,
		required: true
	},
    height: {
		type: Number,
		required: true
	},
    box_count: {
        type: Number,
        required: true
    },
	text: {
		type: [String],
	},
	template: {
		type: String
	},
	owner: {type: Schema.Types.ObjectId, ref: "User"}
});

const Meme = model('Meme', memeSchema);

module.exports = Meme;
