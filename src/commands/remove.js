'use strict';

var pokedex = require('../pokedex'),
    _ = require("lodash");


/**
 * Remove command
 * @module command/remove
 */
module.exports = {

    /** Command name */
    name: '/remove',

    /** Command regex pattern */
    pattern: /\/remove ?([^ ]*)/i,

    /** Command's description to be listed in /help */
    description: '/remove name [name]... - Removes Pokémon from the watchlist',

    /** Is the command listed in Telegram's command list? */
    list: function(user) {
        return user.active === true;
    },

    /**
     * Callback to execute when a user executes the command.
     * @param {Object} msg - The Telegram message object.
     * @param {Array}  match - The regex match result.
     * @param {Object} user - The user's stored Mongoose model.
     * @param {Boolean} created - Was the user created as a result of the command call?
     */
    callback: function(msg, match, user, created) {
	if(match[1] == "")
	{
	    var keyboard = [];
            _.forEach(user.watchlist, function(id) {
	        keyboard.push([ { "text" : "/remove " + pokedex.pokedex[id] } ]);;
            });

	    while(keyboard.length > 150)
		keyboard.pop();


	    for(var i = 0; i < keyboard.length-1; i++)
    	    {
    	        keyboard[i].push(keyboard[i+1][0]);
	        keyboard.splice(i+1,1);
	    }


	    return { "msg" : "Which pokemon would you like to remove?", "keyboard" : keyboard };
	}

        var toRemoveIds = pokedex.getPokemonIdsFromArgumentString(match[1]).filter(function(item) {
            return !isNaN(item);
        });

	if(toRemoveIds.length == 0)
	{
	    var keyboard = [];
            _.forEach(user.watchlist, function(id) {
	        keyboard.push([ { "text" : "/remove " + pokedex.pokedex[id] } ]);;
            });

	    while(keyboard.length > 150)
		keyboard.pop();

	    for(var i = 0; i < keyboard.length-1; i++)
    	    {
    	        keyboard[i].push(keyboard[i+1][0]);
	        keyboard.splice(i+1,1);
	    }

	    return { "msg" : "Which pokemon would you like to remove?", "keyboard" : keyboard };
	}


        user.watchlist = user.watchlist.filter(function(number) {
            return toRemoveIds.indexOf(number) === -1;
        });

        user.save();
	return toRemoveIds.length + " pokemon removed";
    }

};
