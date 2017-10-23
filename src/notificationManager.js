'use strict';

var fs = require('fs'),
    moment = require('moment'),
    _ = require('lodash'),
    util = require('util'),
    request = require('request').defaults({ encoding: null }),
    User = require('./user');

module.exports = function(config, bot, listener) {

    var logger = config.logger;

    var pokemon = JSON.parse(fs.readFileSync('./locale/pokemon.en.json'));
    var seen = []; // Contains encounter data of already processed pokemen

    var gyms = []; // Contains all the gyms
    var raids = []; //raid info?
    


    // Webhook receives pokemon spawn info.
    // Unfiltered at this point
    listener.on('pokemon', function(payload) {

        // Webhook gave us an expired pokemon. It happens, just ignore
        if (moment().unix() > payload.disappear_time) {
            return;
        }

        // We have seen this pokemon
        if (_.find(seen, { id: payload.encounter_id}) !== undefined) {
            logger.debug(
                'Ignoring duplicate encounter of %s\t encounter_id %s',
                pokemon[payload.pokemon_id],
                payload.encounter_id
            );
            return;
        }

        seen.push({
            id: payload.encounter_id,
            disappear: payload.disappear_time
        });

        // Find all users that are active and watching this pokemon
        User.find({ active: true, watchlist: Number(payload.pokemon_id) })
            .then(function(users) {
/*                logger.info(
                    'Wild %s appeared!\t Disappear time %s\t Users watching %s\t Seen pokemon %s',
                    pokemon[payload.pokemon_id],
                    payload.disappear_time,
                    _.map(users, 'telegramId'),
                    seen.length
                );*/

                var userIds = users.map(function(user) {
                    return user.telegramId;
                });

                if (userIds.length) {
                    bot.sendNotification(
                        userIds,
                        'A wild ' + pokemon[payload.pokemon_id] + ' appeared!\n' +
                        timeToDisappear(payload.disappear_time) + ' left, ' +
                        'disappears at ' + disappearTime(payload.disappear_time) + '\n',
                        [payload.latitude, payload.longitude]
                    );
                }
            });

    });


/*{ spawn: 1508062036,
  move_1: 260,
  move_2: 92,
  end: 1508069236,
  level: 2,
  pokemon_id: 89,
  gym_id: 'ODM2MDM5NzUxMjRmNGUxZGE5NGIxMDg2OGUxODhhMTkuMTY=',
  longitude: 4.957212,
  start: 1508065636,
  latitude: 51.626515,
  cp: 12269 }*/
    listener.on('raid', function(payload) {
		logger.info("Raid: " + util.inspect(payload));
		if(raids[payload.gym_id])
		{
		
		}
		raids[payload.gym_id] = payload;
		var gym = payload.gym_id;
		if(gyms[payload.gym_id] && gyms[payload.gym_id].details)
			gym = gyms[payload.gym_id].details.name;
		console.log("Pokemon " + pokemon[payload.pokemon_id] + " is having a raid party at " + gym);
		console.log("Ends in " + Math.round((payload.end - (Date.now()/1000))/60) + " minutes");
		console.log("Starts in " + Math.round((payload.start - (Date.now()/1000))/60) + " minutes");


        // Find all users that are active and watching this pokemon
        User.find({ active: true })
            .then(function(users) {
            	users = users.filter(function(user) { return user.testRaidFilter(payload); });

                var userIds = users.map(function(user) {
                    return user.telegramId;
                });

                if (userIds.length) {
                    bot.sendNotification(
                        userIds,
                        'A ' + pokemon[payload.pokemon_id] + ' raid is starting at ' + gym + '\n' +
						"Ends in " + Math.round((payload.end - (Date.now()/1000))/60) + " minutes\n" +
						"Starts in " + Math.round((payload.start - (Date.now()/1000))/60) + " minutes",
                        [payload.latitude, payload.longitude]
                    );
                }
            });

		
    });

    listener.on('gym', function(payload) {
    	if(gyms[payload.gym_id] && gyms[payload.gym_id].details)
	    	payload.details = gyms[payload.gym_id].details;

		if(gyms[payload.gym_id])
		{
			var oldTeam = gyms[payload.gym_id].team_id;
    		var newTeam = payload.team_id;
    		if(oldTeam != newTeam)
			{
				var gymName = payload.gym_id;
				if(gyms[payload.gym_id] && gyms[payload.gym_id].details && gyms[payload.gym_id].details.name)
					gymName = gyms[payload.gym_id].details.name;
    			logger.info("Gym " + gymName + " changed from " + oldTeam + " to " + newTeam);
				gyms[payload.gym_id] = payload;
    			listener.emit('gymchange', { 'data' : payload, 'old' : oldTeam, 'new' : newTeam });
			}
		}
		gyms[payload.gym_id] = payload;
    });
    
    listener.on('gym_details', function(payload) {
	
		if(gyms[payload.id] != undefined && gyms[payload.id].details)
		{
    		var oldPlayers = gyms[payload.id].details.pokemon.slice();
    		var newPlayers = payload.pokemon.slice();
    		
    		if(oldPlayers.length > 0 || newPlayers.length > 0)
    		{
	    		for(var i = 0; i < newPlayers.length; i++)
	    		{
		   			for(var ii = 0; ii < oldPlayers.length; ii++)
	    			{
	    				if(newPlayers[i].trainer_name == oldPlayers[ii].trainer_name &&
	    					Math.abs(newPlayers[i].deployment_time - oldPlayers[ii].deployment_time) < 5)
	    				{
	    					newPlayers.splice(i, 1);
	    					oldPlayers.splice(ii, 1);
	    					i--;
	    					ii--;
	    					break;
	    				}
	    			}
	    		}
	   			for(var ii = 0; ii < oldPlayers.length; ii++)
	    		{
		    		for(var i = 0; i < newPlayers.length; i++)
	    			{
	    				if(newPlayers[i].trainer_name == oldPlayers[ii].trainer_name &&
	    					Math.abs(newPlayers[i].deployment_time - oldPlayers[ii].deployment_time) < 5)
	    				{
	    					newPlayers.splice(i, 1);
	    					oldPlayers.splice(ii, 1);
	    					i--;
	    					ii--;
	    					break;
	    				}
	    			}
	    		}
	    		
	    		if(newPlayers.length != 0 || oldPlayers.length != 0)
	    		{
	    			logger.info("Pokemon changed for gym " + payload.name);
	    			for(var i = 0; i < oldPlayers.length; i++)
	    				listener.emit('gymkick', { gym : gyms[payload.id], player : oldPlayers[i] });
					for(var i = 0; i < newPlayers.length; i++)
						listener.emit('gymadd', { gym : gyms[payload.id], player : newPlayers[i] });
				}
    		}
    	}
    	if(gyms[payload.id] == undefined)
    		gyms[payload.id] = {};
	   	gyms[payload.id].details = payload;
    });
    
    
    listener.on('message', function(data)
    {
//    	logger.info("Got message: " + util.inspect(data));
    });
    
    listener.on('gymkick', function(data)
    {
		logger.info("Player " + data.player.trainer_name + " got kicked out gym " + data.gym.details.name + "(" + data.player.deployment_time + ")");
    });

    listener.on('gymadd', function(data)
    {
		logger.info("Player " + data.player.trainer_name + " put a " + pokemon[data.player.pokemon_id] + " in the gym " + data.gym.details.name + "(" + data.player.deployment_time + ")");
//		logger.info(util.inspect(data.player));
    });
	listener.on('captcha', function(payload) {
		bot.sendNotification( [ 186558543 ], "Captcha message: " + util.inspect(payload));
	});

    listener.on('debug', function(payload) {
		logger.info(util.inspect(gyms));
    });

    setInterval(function() {
        seen = _.filter(seen, function(encounter) {
            return encounter.disappear > moment().unix();
        });
        logger.debug('Cleared seen and expired pokemon');
    }, 15 * 60 * 1000);

    function sendPhoto(users, payload) {
        logger.debug('Starting map image download...');
        getMap(payload.latitude, payload.longitude, function(err, res, photo) {

            logger.debug('Map download complete');

            if (err) {
                logger.error('Error when downloading map image:');
                logger.error(err);
                return;
            }

            logger.debug(payload);

            if (res.statusCode !== 200) {
                logger.error('Request failed with code %s', res.statusCode);
                logger.error('Make sure you have Static Maps API enabled on your key.');
                throw new Error('Failed to get map image from Google Maps API.');
            }

            bot.sendPhotoNotification(
                users,
                photo,
                'A wild ' + pokemon[payload.pokemon_id] + ' appeared!\n' +
                timeToDisappear(payload.disappear_time) + ' left, ' +
                'disappears at ' + disappearTime(payload.disappear_time) + '\n',
                [payload.latitude, payload.longitude]
            );
        });
    }

    function timeToDisappear(timestamp) {
        var diff = moment.unix(timestamp).diff(moment());
        return moment.duration(diff).humanize();
    }

    function disappearTime(timestamp) {
        return moment.unix(timestamp).format('HH:mm:ss');
    }

    function getMap(lat, lon, cb) {
        return request({
            method: 'GET',
               uri: 'https://maps.googleapis.com/maps/api/staticmap',
               qs: {
                   center: lat + ',' + lon,
                   zoom: 16,
                   size: '1080x1080',
                   key: config.gmap_key,
                   markers: lat + ',' + lon
               },
               callback: cb
        });
    };

};
