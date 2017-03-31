'use strict';

const Boom = require('boom');

const mBorrowers = require('../models/borrowers.js');

exports.add = function (request, reply) {

	var body = request.payload;
    mBorrowers.add(body, (err, res) => {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return reply(Boom.badRequest('SSN already exists'));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
    })
}

exports.checkout = function(request, reply) {
    var body = request.payload;

    mBorrowers.checkout(body, (err, res) => {
        if (err) {
            return reply(Boom.badRequest(res));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
    })
}

exports.checkin = function(request, reply) {
    var body = request.payload;

    mBorrowers.checkin(body, (err, res) => {
        if (err) {
            return reply(Boom.badRequest(res));
        } else if (res) {
            return reply(res);
        } else {
            return reply([]);
        }
    })
}
