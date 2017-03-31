'use strict';

const Boom = require('boom');

const mFines = require('../models/fines.js');

exports.add = function (request, reply) {
 mFines.add(function(err, res){
        if (err) {
            return reply(Boom.badRequest(res));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
    })
}

exports.get = function (request, reply) {
	var cardno = parseInt(request.params.cardno, 10);

	mFines.get(cardno, function(err, res){
		if (err) {
            return reply(Boom.badRequest(res));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
	})
}

exports.update = function(request, reply) {
	var cardno = parseInt(request.params.cardno, 10);

	mFines.update(cardno, (err, res) => {
		if (err) {
            return reply(Boom.badRequest(res));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
	})
}
