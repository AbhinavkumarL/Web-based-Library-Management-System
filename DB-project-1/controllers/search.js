'use strict';

const Boom = require('boom');

const mSearch = require('../models/search.js');

exports.search = function (request, reply) {

	var isbn = (request.query.isbn) ? request.query.isbn : null;
    var title = (request.query.title) ? request.query.title : null;
    var author = (request.query.author) ? request.query.author : null;

    mSearch.search(isbn, title, author, (err, res) => {
    	if (err) {
    		return reply(Boom.badRequest(res));
        } else if (res && res.length) {
            return reply(res);
        } else {
            return reply([]);
        }
    })
}
