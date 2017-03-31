'use strict';

const db = require('../db.js');


var getBookLoanDetailsDb = function (cb) {
	var q = "select * from book_Loans where due_date < curdate() and date_in ='"+"1900-01-01"+"'";

	db.query(q, function (err, res){
		if (err) {
			cb(err, res);
		} else if (res && res.length) {
			cb(null, res);
		} else {
			cb('notfound', 'Book loan not found');
		}
	})
}


var updateFinesDb = function (cb) {
	var q = 'update fines set fine_Amount = fine_Amount+0.25 where paid = 0';

	db.query(q, (err, res) => {
		if (err) {
			cb(err, null);
		} else {
			cb(null, res);
		}
	})
}

var addFineDb = function (body, cb) {
	var q = 'insert into fines (loan_Id, fine_Amount, paid )'
		+ ' values (?, ?, ?)';

	var values = [
		body.loanId,
		body.days*0.25,
		0
	];

	db.query(q, values, (err, res) => {

		if (err && err.code === 'ER_DUP_ENTRY') {
			if (body.datein) {
				cb(null, {status: 'Book is checkedin, fine is not updated'});
			} else {
				var q = 'update fines set fine_Amount = ? where loan_Id = ?';

				db.query(q, [body.days*0.25, body.loanId], (err, res) => {
					if (err) {
						cb(err, null);
					} else {
						cb(null, res);
					}
				})
			}
		} else if (err) {
			cb(err, null);
		} else {
			cb(null, res);
		}
	})
}

var getFinesDb = function(cardno, cb) {
	var q = 'select sum(fine_Amount) as totalFine from book_Loans, fines where '
		+ 'book_Loans.loan_Id = fines.loan_Id and book_Loans.card_id = ? and fines.paid = 0';

	db.query(q, [cardno], (err, res) => {
		if (err) {
			cb(err, null);
		} else if (res && res.length) {
			cb(null, res);
		} else {
			cb(null, []);
		}
	})
}

var getBookLoansDb = function (cardno, cb) {
	var q = 'select * from book_Loans where card_id = ?';

	db.query(q, [cardno], (err, res) => {
		if (err) {
			cb(err, null);
		} else if (res && res.length) {
			cb(null, res);
		} else {
			cb(null, null);
		}
	})
}

var payFineDb = function(cardno, cb) {
	var q = 'update fines set paid = 1 where loan_Id in (select loan_Id from book_Loans where card_id = ?)';

	db.query(q, [cardno], (err, res) => {
		if (err) {
			cb(err, null);
		} else {
			cb(null, res);
		}
	})
}

var dateDiffInDays = function (a, b) {
	var _MS_PER_DAY = 1000 * 60 * 60 * 24;

	var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

exports.add = function (cb) {
	updateFinesDb(function (err, res) {
		if (err) {
			cb(err, null);
		} else {
			getBookLoanDetailsDb((err, res) => {
				if (err) {
					cb(err, res);
				} else if (res && res.length) {
					var count = 0;
					res.forEach((r) => {
					console.log(r);
						var days = dateDiffInDays(r.DUE_DATE, new Date());
						console.log(days);
						if (days > 0) {
							var body = {};
							body.days = days;
							body.loanId = r.LOAN_ID;
							body.datein = r.DATE_IN;
							addFineDb(body, (err, resp) => {
								if (err) {
									cb(err, resp);
								} else {
									count += 1;
									if (count === res.length) {
										cb(null, {status: 'succesfully updated'});
									}
								}
							})
						} else {
							count += 1;
							if (count === res.length) {
								cb(null, {status: 'succesfully updated'});
							}
						}
					})
				} else {
					cb(null, {status: 'succesfully updated'});
				}
			})
		}
	})	
}

exports.get = function(cardno, cb) {
	getFinesDb(cardno, (err, res) => {
		if (err) {
			cb(err, res);
		} else if (res && res.length && res[0].totalFine !== null) {
			cb(null, {cardno: cardno, totalFine: '$' + res[0].totalFine});
		} else {
			cb(null, {cardno:cardno, totalFine: '$0'});
		}
	})
}

exports.update = function(cardno, cb) {
	getBookLoansDb(cardno, (err, res) => {

		if (err) {
			cb(err, null);
		} else if (res && res.length) {
			var check = true;

			res.forEach((r) => {
				if (r.datein === null) {
					check = false;
				}
			})

			if (check) {
				payFineDb(cardno, (err, res) => {
					if (err) {
						cb(err, null);
					} else {
						cb(null, {status: 'Payment succesfull'});
					}
				})
			} else {
				cb('badrequest', 'Please checkin book/books before you pay fine.');
			}
		} else {
			cb('notfound', 'no book loans found');
		}
	})
}
