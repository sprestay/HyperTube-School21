const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title: { type: String, require: true, unique: true },
	imdb: { type: String, require: true, unique: true },
	files: {
		type: {
			path: String,
			folder: String,
			extension: String,
			complete: Boolean,
			lastview: Date,
			size: Number
		}
	},
	data: {},
	comments : [
		{
			userId: String,
			content: String,
			date : Date
		} 
	],
});
const Movie = mongoose.model('Movie', movieSchema);

const subSchema = new mongoose.Schema({
	movie_imdb: { type: String, require: true, unique: true },
	files: [
		{
			path: String,
			lang: String,
		}
	]
});
const Sub = mongoose.model('Subtitle', subSchema);

exports.Movie = Movie;
exports.Sub = Sub;
