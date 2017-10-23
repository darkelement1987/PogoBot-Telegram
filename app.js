'use strict';

var logger   = require('winston'),
    express  = require('express'),
    config   = require('config.json')('./config.json'),
    mongoose = require('mongoose');
    
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {'timestamp':true});

if (process.env.NODE_ENV === 'development') {
}
    logger.level = 'debug';

config.logger = logger;

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb);
var db = mongoose.connection;
db.once('open', function() {
    logger.info('Connected to Mongodb on %s', config.mongodb);

    var listener = require('./src/listener')(express(), config);
    var bot = require('./src/bot')(config, listener);
    var manager = require('./src/notificationManager')(config, bot, listener);
});

db.on('error', function() {
    logger.error('Mongodb connection failed!');
});
