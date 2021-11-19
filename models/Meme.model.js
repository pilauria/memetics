const { Schema, model } = require('mongoose');


const memeSchema = new Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
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
    }
	//favorites: [{ type: Schema.Types.ObjectId, ref: 'Meme', default: [] }]
});

const Meme = model('Meme', memeSchema);

module.exports = Meme;
