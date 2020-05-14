const User = require('../user/model.js');
const bcrypt = require('bcrypt');
const utilities = require('./utilities.js');
const uuidv1 = require('uuid/v1');
const formidable = require('formidable');
const fs = require('fs-extra');
const jwt  = require('jsonwebtoken');

async function createNewUser(strategyPassport, profile) {
	let user;
	if (strategyPassport === 'local')
	{
		let pass = bcrypt.hashSync(profile.password, 10);
		user = User({
			username: profile.username,
			lastname: profile.lastname,
			firstname: profile.firstname,
			mail: profile.mail,
			password: pass,
			avatar: profile.avatar,
			sourceId: { source: "local" },
			tokenForget: profile.tokenForget,
			complete: true,
		});
	}
	else if (strategyPassport === '42') {
		user = new User({
			firstname: profile.name.givenName.toLowerCase(),
			lastname: profile.name.familyName.toLowerCase(),
			mail: profile.emails[0].value,
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			avatar: profile.photos[0].value
		});
	} else if (strategyPassport === 'github'){
		user = new User({
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			mail: profile._json.email,
			avatar: profile.photos[0].value
		});
	} else if (strategyPassport === 'instagram') {
		user = new User({
			lastname: profile.name.familyName,
			firstname: profile.name.givenName,
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			avatar: profile._json.data.profile_picture
		});
	}
	try {
		let result = await user.save();
		return result;
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return ({error: "User already exists"});
	}
}

exports.registerUser = async function (req, res) {
	let err = [];
	let img;
	let form = new formidable.IncomingForm();
	form.parse(req, async function (error, fields, files) {
		if (error)
			return res.send({error: 'unknown'});
		for (let field in fields)
		{
			if (field === 'cfpassword') {
				err.push({
					field: field,
					error: await utilities.checkInfo(field, fields[field], fields['password'])
				});
			} else {
				err.push({
					field: field,
					error: await utilities.checkInfo(field, fields[field])
				});
			}
		}
		if (files.file)
		{
			img = saveAvatar(files.file);
			err.push({
				field: 'img',
				error: img.error
			});
		}
		if (err.length !== 7)
			return res.send({error: 'missing'});
		else {
			err = err.filter(e => e.error);
			if (err.length === 0) {
				let token = uuidv1();
				let result = await createNewUser("local", {...fields,
					avatar: img.path, tokenForget: token});
				if (result.error)
					res.send({error: result.error});
				else {
					await utilities.sendMail("activate", fields.mail,
						fields.username, token, "eng");
					res.sendStatus(200);
				}
			} else
				res.send({error: err});
		}
	})
};

function createCookie(req, res, isLocal) {
	let token = jwt.sign({id: req.user._id},
		process.env.JWT_KEY,
		{expiresIn: 7200000}
	);
	res.cookie('accessToken', token, { expires: new Date(Date.now() + 7200000),
		httpOnly: true, signed: true});
	if (isLocal)
		return res.send(req.user);
	else
		return res.redirect('http://localhost:3000');//3001 prod
}

function saveAvatar(file) {
	let error = checkImg(file);
	try {
		if (error)
		{
			fs.unlinkSync(file.path);
			return ({error: error});
		}
		else
		{
			let newname = uuidv1() + file.name;
			let newpath = `./files/avatar/${newname}`;
			fs.copySync(file.path, newpath);
			fs.unlinkSync(file.path);
			return ({path: `/files/avatar/${newname}`, error: error});
		}
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		error ? error : 'unknow';
		return ({error: error});
	}
}

function checkImg(img)
{
	let error = null;

	if (!img.type.match(/image\/?(png)|(jpg)|(jpeg)/))
		error = 'format';
	else if (img.name.length === 0)
		error = 'empty';
	else if (img.size > 1000000)
		error = 'size';
	return error;
}

exports.forgetPass = async function(req, res) {
	try {
		let user = await User.findOne({ username: req.body.username });
		if (!user)
			return res.sendStatus(404);
		let token = uuidv1();
		if (user.mail) {
			if (!user.tokenForget)
			{
				user.tokenForget = token;
				user.markModified('tokenForget');
				await user.save();
				utilities.sendMail("forget", user.mail, user.username, user.tokenForget, user.lang);
				return res.sendStatus(200);
			} else
				return res.send({info: "already"});
		} else
			return res.sendStatus(404);
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return res.sendStatus(404);
	}
}
/* MODIFIER PASSWORD FOR FORGET PASS OR UPDATE IN ACCOUNT*/
exports.editPass = async function (req, res) {
	try {
		let err = [];
		const { token, password, cfpassword } = req.body;
		let user = await User.findOne({tokenForget: token});
		if (!user)
			user = await User.findById(token).exec();
		if(!user)
			return res.sendStatus(404);
		let forget;
		user.tokenForget === '' ? forget = false : forget = true;
		err.push({
			filed: 'password',
			error: await utilities.checkInfo('password', password)
		});
		err.push({
			filed: 'cfpassword',
			error: await utilities.checkInfo('cfpassword', password, cfpassword)
		});
		err = err.filter(e => e.error);
		if (err.length === 0){
			user.password = bcrypt.hashSync(password, 10);
			user.tokenForget = '';
			await user.save();
			if (forget)
				return (res.send({origin: 'forget'}));
			else
				return (res.send({origin: 'user'}))
		}
		else
			return res.send({error : err});
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return res.sendStatus(404);
	}
}

/* REGISTRATION LOCAL => ACTIVATION */
exports.activate = async function (req, res) {
	if (req.params.token) {
		try {
			let user = await User.findOne({tokenForget: req.params.token});
			if (user) {
				user.tokenForget = '';
				await user.save();
				return res.send(user.username);
			}
			else
				return res.sendStatus(404);
		} catch (e) {
			if (process.env.MODE === 'DEV')
				console.error(e);
			return res.sendStatus(404);
		}
	}
}

exports.addAvatar = saveAvatar;
exports.createUser = createNewUser;
exports.createCookie = createCookie;
