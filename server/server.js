const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const jwt  = require('jsonwebtoken');
const User = require('./routes/user/model.js');

const PORT = 3001;
const app = express();

mongoose.connect(`mongodb+srv://user:user@hypertube-re3ev.mongodb.net/test?retryWrites=true&w=majority`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Db connection succeed');
})

require('./cronjob.js');

//ROUTERS
const userRouter = require('./routes/user');
const libraryRouter = require('./routes/library');
const movieRouter = require('./routes/movie');
const authRouter = require('./routes/auth');

//MIDDLEWARES
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_KEY));
app.use('/files', express.static(__dirname + '/files'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(async function (req, res, next) {
	let reg = /^\/(user|library|movie)/;
	let cookie = req.signedCookies.accessToken;
	let decoded;
	if (reg.test(req.path))
	{
				if (cookie)
				{
					decoded = jwt.verify(cookie, process.env.JWT_KEY);
					if (decoded.id && await User.findById(decoded.id).exec())
						next();
					else
						return res.sendStatus(401);
				}
				else
					return res.sendStatus(401);
	}
	else
		next();
});


app.use('/user', userRouter);
app.use('/library', libraryRouter);
app.use('/movie', movieRouter);
app.use('/auth', authRouter);


app.use(function(req, res, next) {
	res.status(404).send('Sorry cant find that!');
});
app.listen(PORT, function () {
	console.log('\x1b[1m', `Server ready on port ${PORT}`, '\x1b[0m');
});
