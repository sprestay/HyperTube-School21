const scrapper = require('./scrapper.js');
const utilities = require('./utilities');
const process = require('process');

async function getLastAdded(req, res) {
	let page = req.query.page || 1;
	try {
		let scrap = await scrapper.fetchAPI('lastadded', page);
		scrap = utilities.filterScrap(scrap);
		scrap = await utilities.mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getPopular(req, res) {
	let page = req.query.page || 1;
	try {
		let scrap = await scrapper.fetchAPI('popular', page);
		scrap = utilities.filterScrap(scrap);
		scrap = await utilities.mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getRandom(req, res) {
	try {
		let scrap = await scrapper.fetchAPI('random');
		scrap = utilities.filterScrap(scrap);
		scrap = await utilities.mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getSearch(req, res) {
	let str = req.query.name || '42';
	try {
		let scrap = await scrapper.fetchAPI('search', 1, str);
		scrap = utilities.filterScrap(scrap);
		scrap = await utilities.mapScrap(scrap);
		scrap = scrap.sort(utilities.sortByName);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}

exports.getLastAdded = getLastAdded;
exports.getPopular = getPopular;
exports.getRandom = getRandom;
exports.getSearch = getSearch;
