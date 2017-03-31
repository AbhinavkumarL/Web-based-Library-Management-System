'use strict';

const Hapi = require('hapi');
const routes = require('./routes.js');

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 3000,
    routes: {
    	cors: true
    }
});

server.route(routes);

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at: ' + server.info.uri);
});
