const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//SCHEMA MANAGE USER
const userSchema = new Schema({
	username: String,
	lastname: String,
	firstname: String,
	mail: String,
	password: String,
	avatar: String,
	sourceId: {
		source: String,
		id: String
	},
	views: {
		type: Array,
		default: []
	},
	lang: {
		type: String,
		default: "eng"
	},
	tokenForget: {
		type: String,
		default: ''
	},
	complete : {
		type : Boolean,
		default: false
	}
});
module.exports = mongoose.model('User', userSchema)
