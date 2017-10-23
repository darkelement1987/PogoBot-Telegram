'use strict';

var bodyParser = require('body-parser'),
    jsonParser = bodyParser.json(),
    util = require('util'),
    events = require('events');

module.exports = function(app, config) {

    var emitter = new events.EventEmitter();
    var logger = config.logger;

    app.use(jsonParser);

    app.post('/', function(req, res) {
	for(var i in req.body)
	{
	    var el = req.body[i];

            if (el.type == 'pokemon') {
	            emitter.emit('pokemon', el.message);
            }
            else if (el.type == 'gym') {
				emitter.emit('gym', el.message);
            }
            else if (el.type == 'gym_details') {
				emitter.emit('gym_details', el.message);
            }
            else if (el.type == 'raid') {
				emitter.emit('raid', el.message);
            }
            else if(el.type == 'captcha') {
            	emitter.emit('captcha', el.message);
            }
		    else
				logger.info("Unknown message type: " + el.type + " : " + util.inspect(el));

	}
        res.status(200).send();
    });

    app.listen(config.port, function() {
        logger.info('Express listening on port ' + config.port);
    });

    return emitter;
};
