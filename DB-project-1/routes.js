'use strict';

const Joi = require('joi');

const cSearch = require('./controllers/search.js');
const cBorrowers = require('./controllers/borrowers.js');
const cFines = require('./controllers/fines.js');

module.exports = [
	{
		method: 'GET',
	    path: '/search',
	    handler: cSearch.search
	},
	{
		method: 'POST',
		path: '/borrowers',
		handler: cBorrowers.add
	},
	{
		method: 'POST',
		path: '/borrowers/checkout',
		handler: cBorrowers.checkout
	},
	{
		method: 'POST',
		path: '/borrowers/checkin',
		handler: cBorrowers.checkin
	},
	{
		method: 'POST',
		path: '/fines',
		handler: cFines.add
	},
	{
		method: 'GET',
		path: '/fines/{cardno}',
		handler: cFines.get
	},
	{
		method: 'PUT',
		path: '/fines/{cardno}',
		handler: cFines.update
	}
]
