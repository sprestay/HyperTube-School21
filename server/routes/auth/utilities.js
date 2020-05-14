const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	sendmail: true,
	newline: 'unix',
	path: '/usr/sbin/sendmail'
});
const User = require('../user/model.js');
const jwt  = require('jsonwebtoken');

exports.checkInfo = async function(type, str, str2) {
	let error = null;

	if (str.length === 0)
		return ('empty');
	if (type === 'mail')
	{
		if (str.length > 250)
			error = 'length';
		else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$/.test(str))
			error = "format";
		else if (await User.findOne({mail: str}).exec())
			error = 'alreadyTaken';
	}
	else if (type === 'password')
	{
		if (str.length > 30)
			error = 'length';
		else if (!(str.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).{6,}$/)))
			error = 'format';
	}
	else if (type === 'cfpassword' & str !== str2)
		error = 'diff';
	else
	{
		if (str.length > 50)
			return ('length');
		if (type === 'username')
		{
			if (/\W/.test(str))
				error = 'format';
			else if (await User.findOne({username: str}).exec())
				error = 'alreadyTaken';
		}
		else if (type === 'lastname')
		{
			if (!(str.match(/^[a-zA-Z ]+$/)))
				error = 'format';
			else if (str.match(/(^\s|\s$|\s[\s]+)/))
				error = 'format';
		}
		else if (type === 'firstname')
		{
			if (!(str.match(/^[a-zA-Z-]+$/)))
				error = 'format';
			else if (str.match(/(^-|-$|-[-]+)/))
				error = 'format';
		}
	}
	return (error);
}

exports.sendMail = async function(type, email, username, token, lang) {
	if (email && type === "forget")
	{
		if (lang === 'eng') {
			transporter.sendMail({
				from: '"Hypertube" Hypertube@hypertube.com',
				to: email,
				subject: 'Request to reset the password',
				text: `Hello ${username},\n`
				+ "It happens to everyone to forget his password.\n"
				+ "Go, click on this link or copy it in the search bar,\n"
				+ "and here we go again for the fantastic stream,\n"
				+ `http://localhost:3000/motdepasse/${token}`
				//	+ `http://localhost:3001/motdepasse/${token}`
			}, (err, info) => {
				if (process.env.MODE === 'DEV')
					if (err)
						console.error(err);
			});
		} else {
			transporter.sendMail({
				from: '"Hypertube" Hypertube@hypertube.com',
				to: email,
				subject: 'Demande de réinitialisation du mot de passe',
				text: `Bonjour ${username},\n`
				+ "Ça arrive à tout le monde d'oublier son mot de passe.\n"
				+ "Allez, clique sur ce lien ou copie le dans la barre de recherche,\n"
				+ "Et c'est reparti pour du super stream,\n"
				+ `http://localhost:3000/motdepasse/${token}`
				//+ `http://localhost:3001/motdepasse/${token}`
			}, (err, info) => {
				if (process.env.MODE === 'DEV')
					if (err)
						console.error(err);
			});
		}
	} else if (email && type === "activate") {
		transporter.sendMail({
			from: '"Hypertube" Hypertube@hypertube.com',
			to: email,
			subject: 'Please activate your account at HyperTube',
			text: `Good day, ${username},\n`
			+ "Click on this link or copy it to your browser,\n"
			+ "to activate your account at HyperTube!\n"
			+ `http://localhost:3000/activer/${token}`
			//	+ `http://localhost:3001/activer/${token}`
		}, (err, info) => {
			if (process.env.MODE === 'DEV')
				if (err)
					console.error(err);
		});
	}
}

exports.checkFields = async function(req, res) {
	let error;
	if (req.params.name === 'cfpassword')
	{
		error = await checkInfo(req.params.name, req.body.password,
			req.body.cfpassword);
	}
	else
		error = await checkInfo(req.params.name, req.body.value);

	if (error)
		res.send({error: error});
	else
		res.sendStatus(200);
};

exports.checkCookie = async function(req, res) {
	let cookie = req.signedCookies.accessToken;
	if (cookie)
	{
		const userId = jwt.verify(cookie, process.env.JWT_KEY).id;
		if (userId)
		{
			let user = await User.findById(userId).exec();
			if (user)
				return res.send({
					id: user.id,
					username: user.username || null,
					avatar: user.avatar || null,
					complete: user.complete,
					lang: user.lang,
					views: user.views
				});
		}
	}
	return res.sendStatus(200);
}