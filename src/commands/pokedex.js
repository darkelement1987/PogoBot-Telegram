'use strict';

var pokedex = require('../pokedex'),
    logger = require('winston'),
    util = require('util'),
    _ = require('lodash');

/** Pokedex command
 * @module command/pokedex
 */
module.exports = {

    /** Command name */
    name: '/pokedex',

    /** Command regex pattern */
    pattern: /\/pokedex ?([^ ]*)/i,

    /** Command's description to be listed in /help */
    description: '/pokedex [name]- Searches for a pokemon',

    /** Is the command listed in Telegram's command list? */
    list: true,

    /**
     * Callback to execute when a user executes the command.
     * @param {Object} msg - The Telegram message object.
     * @param {Array}  match - The regex match result.
     * @param {Object} user - The user's stored Mongoose model.
     * @param {Boolean} created - Was the user created as a result of the command call?
     */
    callback: function(msg, match, user, created) {
	var search = "";
	if(match[1])
	    search = match[1];


        var names = [];
	var i = 0;
        _.forEach(pokedex.pokedex, function(name, number) {
	    if(search != "")
		if(name.toLowerCase().indexOf(search.toLowerCase()) == -1)
		    return;

	    var index = Math.floor(i/100);

	    while(names.length <= index)
		names.push([]);
            names[index].push(number + ') ' + name);
	    i++;
        });

	for(var i in names)
	    names[i] = names[i].join("\n");

	return names;
    }

};
