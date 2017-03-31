'use strict';

const db = require('../db.js');

var searchDb = function(isbn, title, author, cb) {
	var q;

	if (isbn !== null) {
		q = 'select  b.isbn, b.title, a.name, b.checkedout from authors a, book b , book_authors c where c.author_id = a.author_id and  c.isbn = b.isbn and c.isbn = "' + isbn + '"';
	} else {
		if (title !== null && author !== null) {
			q = 'select  b.isbn, b.title, a.name, b.checkedout from authors a, book b , book_authors c where c.author_id= a.author_id and c.isbn = b.isbn and b.title like "%' + title + '%" or a.name like "%' + author + '%"';
				
		} else if (title !== null) {
			q = 'select  b.isbn, b.title, a.name, b.checkedout from authors a, book b , book_authors c where c.author_id= a.author_id and c.isbn = b.isbn and b.title like "%' + title + '%"';
		} else if (author !== null) {
			q = 'select  b.isbn, b.title, a.name, b.checkedout from authors a, book b , book_authors c where c.author_id= a.author_id and c.isbn = b.isbn and a.name like "%' + author + '%"';
		} else {
			cb('badrequest', 'Please specify a search criteria.');
			return;
		}
	}

	db.query(q, (err, res) => {
		if (err) {
			console.error('models: search.js: searchDb: ' + err);
			cb(err, null);
		} else if (res && res.length) {
			cb(null, res);
		} else {
			cb(null, []);
		}
	})
}

exports.search = function (isbn, title, author, cb) {
	searchDb(isbn, title, author, (err, res) => {
		if (err) {
			cb(err, res);
		} else {
		console.log("line no :41");
			cb(null, res);
		}
	})
}
