const process = require('process');
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://user:user@hypertube-re3ev.mongodb.net/test?retryWrites=true&w=majority`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;
if (process.argv.includes('Movie'))
	db.collections['Movie'].drop( function(err) {
    console.log('collection Movie dropped');
});
else if (process.argv.includes('Subtitle'))
	db.collections['Subtitle'].drop( function(err) {
    console.log('collection Movie dropped');
});
else
	db.dropDatabase();//IF WANTED TO CLEAN
setTimeout(() => {
	process.exit(1);
}, 2000);