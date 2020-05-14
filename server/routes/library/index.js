const express = require('express');
const router = express.Router();
const ctrl = require('./controller.js');

router.get('/', ctrl.getPopular);
router.get('/lastadded', ctrl.getLastAdded);
router.get('/random', ctrl.getRandom);
router.get('/search', ctrl.getSearch);

module.exports = router;
