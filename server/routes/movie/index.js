const express = require('express');
const router = express.Router();
const stream = require('./library/stream.js');
const sub = require('./subtitles.js');
const com = require('./library/comments.js');
const trans = require('./library/translate.js');
const ctrl = require('./controller.js');

router.get('/watch/:url', stream.watchUrl);
router.get('/subtitles', sub.searchSub);
router.post('/comment/add', com.addComment);
router.post('/comment/delete', com.delComment);
router.get('/comment/display', com.displayComment);
router.post('/translate', trans.translate);
router.post('/add', ctrl.addMovie);
router.get('/info/:imdb', ctrl.getMovieInfo);


module.exports = router;
