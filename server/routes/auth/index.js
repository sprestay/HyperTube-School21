const express = require('express');
const router = express.Router();
const passport = require('passport');
const ctrl = require('./controller.js');
const utilities = require('./utilities');

// IMPORT STRATEGY
const {
	localStrategy, fortytwoStrategy, gitHubStrategy, instaStrategy
} = require('./oAuth.js');
passport.use(localStrategy);
passport.use(fortytwoStrategy);
passport.use(gitHubStrategy);
passport.use(instaStrategy);

router.get('/', utilities.checkCookie);
router.post('/registration', ctrl.registerUser);
router.post('/registration/:name', utilities.checkFields);
router.post('/login', function (req, res, next) {
	passport.authenticate('local', function(err, user, info) {
    if (err) { return res.send({error: err}); }
    req.logIn(user, { session: false }, function(err) {
      if (err) { return next(err); }
    ctrl.createCookie(req, res, true);
	});
})(req, res, next);
});
router.get('/42',
	passport.authenticate('42'));
router.get('/42/return',
	passport.authenticate('42', { failureRedirect:
		'http://localhost:3001/auth/login', session: false }), (req, res) => {
		ctrl.createCookie(req, res, false);
	});
router.get('/github', passport.authenticate('github'));
router.get('/github/return',
	passport.authenticate('github', {
		failureRedirect: 'http://localhost:3000/auth/login', session: false }),
	(req, res) => {
		ctrl.createCookie(req, res, false);
	});
router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/return',
	passport.authenticate('instagram', {
		failureRedirect: 'http://localhost:3000/auth/login', session: false }),
	(req, res) => {
		ctrl.createCookie(req, res, false);
	});
router.get('/activate/:token', ctrl.activate);
router.post('/askForgetPass', ctrl.forgetPass);
router.post('/updatePass', ctrl.editPass);
router.get('/logout', function(req, res){
	res.clearCookie('accessToken');
	res.sendStatus(200);

});


module.exports = router;
