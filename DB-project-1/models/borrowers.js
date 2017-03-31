'use strict';

const uuid = require('uuid');
const async = require('async');

const db = require('../db.js');

var addBorrowersDb = function (body, cb) {
	var q = 'insert into borrowers (ssn, borrower_name'
		+ ', address, phone, city, email, state)'
		+ ' values (?, ?, ?, ?, ?, ?, ?)';
		
	var values = [
		body.ssn,
		body.name,
		body.address,
		body.phone,
		body.city,
		body.email,
		body.state
	]

	db.query(q, values, (err, res) => {
		if (err) {
			cb(err, null);
		} else {
			cb(null, res);
		}
	}) 
}

var checkBorrowerDb = function(cardno, cb) {
	var q = 'select * from borrowers where card_id = ?';

	db.query(q, [cardno], (err, res) => {
	//console.log(err, res);
		if (err) {
			cb(err, null);
		} else if (res && res.length) {
		//console.log("line 39");
			cb(null, true);
		} else {
			cb(null, false);
		}
	})
}

var checkAvailabilityDb = function(body, cb) {
	var count = 0;

	var q = 'select * from book where isbn = ? and checkedout = 0';

	db.query(q, [body.isbn], (err, res) => {
		if (err) {
			cb(err, null);
		} else if (res && res.length) {
			cb(null, true);
		} else {
			cb(null, false);
		}
	})
}

var checkOutDb = function(body, cb) {
	var q1 = 'select * from book_Loans where card_id = ?';

	db.query(q1, [body.cardno], function(err, res){
		if (err) {
			cb(err, null);
		} else if (res && res.length < 3) {
		var q2 = "insert into book_Loans ( isbn, card_id, date_out, due_date, date_in"
			+") values ( ?, ?, curdate(), ? ,"+"'"+"1900-01-01"+"')";
			//console.log("line 83:"+q2);


			var count = 0;
			var values = [
				body.isbn,
				body.cardno,
				new Date(+new Date + 12096e5)
			]
			db.query(q2, values, (err, q2res) => {
			//console.log("line 98");
				if (err) {
					cb(err, null);
					//console.log(err);
				} else {
				//console.log("line 117"+ err , q2res);
					var q3 = 'update book set checkedout = 1 where isbn = ?';
					db.query(q3, [body.isbn], function(err, q3res){
					//console.log("line 120:"+err, q3res);
						if (err) {
							cb(err, null);
						} else {
						
							cb(null, {loanId: q2res.insertId});
						}
					})
				}
			})
		} else {
			cb('limitexceeded', 'You have already checked out 3 books');
		}
	})
}

var updateBookLoansDb = function(body, cb) {
	var q = 'update book_Loans set date_in = DATE_FORMAT(now(),'+"'"+'%y-%m-%d'+"'"+') where card_id = ? and isbn = ?';

	db.query(q, [parseInt(body.cardno,10), body.isbn], function(err, res){
		if (err) {
			cb(err, null);
		} else {
		//console.log("line 109"+res);
			cb(null, res);
		}
	})
}

var updateBooksDb = function(isbn, cb) {
	var q = 'update book set checkedout = 0 where isbn = ?';

	db.query(q, [isbn], function(err, res){
		if (err) {
			cb(err, null);
		} else {
			cb(null, res);
		}
	})
}

/**************************************************************************

**************************************************************************/

var verifyCheckOut = function(body, cb) {
//console.log("line 131");
	checkBorrowerDb(body.cardno, function(err, res){
		if (err) {
			cb(err, null);
		} else if (res) {
		//console.log("line 138");
			cb(null, true);
		} else {
			cb('notfound', 'Borrower not found');
		}
	})
}


/**************************************************************************

**************************************************************************/

exports.add = function (body, cb) {
//console.log(body);
	addBorrowersDb(body, (err, res) => {
	//console.log("line 158:"+err, res);
		if (err) {
			cb(err, null);
		} else {
			cb(null, {cardno: res.insertId});
		}
	})
}

exports.checkout = function (body, cb) {
	verifyCheckOut(body, (err, res) => {
		if (err) {
			cb(err, res);
		} else {
			checkAvailabilityDb(body, (err, res) => {
				if (err) {
					cb(err, res);
				} else if (res) {
				//console.log("line 191");
					checkOutDb(body, (err, res) => {
						if (err) {
							cb(err, res);
						} else {
						//console.log("line 197");
							cb(null, res);
						}
					})
				} else {
					cb('unavailable', 'Book is not avaialable for checkout');
				}
			})
		}
	})
}

exports.checkin = function(body, cb) {
//console.log("line 185");
	updateBookLoansDb(body, function(err, res){
	//console.log(err, res);
		if (err) {
			cb(err);
		} else if (res && res.changedRows === 1) {
		//console.log("line 190");
			updateBooksDb(body.isbn, function(err, res){
				if (err) {
					cb(err, res);
				} else {
				//console.log("line 195");
					cb(null, {status: 'updated successfully'});
				}
			})
		} else {
			cb('notfound', 'Book loan not found');
		}
	})
}
