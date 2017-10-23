'use strict';

var config   = require('config.json')('./config.json'),
	util = require('util'),
	raids = require('../raids'),
	pokedex = require('../pokedex'),
    logger = require('winston');



var defaultKeyboard = [
				[ { 'text' : '/raid list' }, { 'text' : '/raid add' } ],
   				[ { 'text' : '/raid remove' }, { 'text' : '/raid ignore' } ]
];

/**
 * Start command
 * @module command/start
 */
module.exports = {

    /** Command name */
    name: '/raid',

    /** Command regex pattern */
    pattern: /\/raid[ ]?([^ ]*)[ ]?([^ ]*)[ ]?([^ ]*)/i,

    /** Command's description to be listed in /help */
    description: '/raid - Allows you to watch for raids',

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
   		if(match[1] == '')
   		{
   		
   			return { 'msg' : "What would you like to do?", "keyboard" : defaultKeyboard };
   		}
   		if(match[1] == 'list')
   		{
   			return { 'msg' : "your raid filters: " + util.inspect(user.raidwatchlist), "keyboard" : defaultKeyboard };
   		}
   		else if (match[1] == 'add')
   		{
   			if(match[2] == '')
   			{
	   			var keyboard = [];

	   			for(var i = 1; i <= 5; i++)
	   				keyboard.push( [ { 'text' : '/raid add level ' + i } ] );
	   			for(var i = 0; i < raids.raids.length; i++)
	   				keyboard.push( [ { 'text' : '/raid add poke ' + pokedex.pokedex[raids.raids[i].pokemon_id] } ] );

			    for(var i = 0; i < keyboard.length-1; i++)
	    	    {
	    	        keyboard[i].push(keyboard[i+1][0]);
			        keyboard.splice(i+1,1);
			    }
	   			return { 'msg' : "What would you like to add?", "keyboard" : keyboard };
			}
			
			if(match[2] == 'level')
			{
				var id = 248;
				var filter = 
				{
					'type' : 'level',
					'level' : match[3],
					'positive' : true,
				};
				user.addRaidFilter(filter);
				return { 'msg' : "Raid filter added", "keyboard" : defaultKeyboard };
			}
			else if(match[2] == 'poke' || match[2] == 'pokemon')
			{
				var id = 248;
				var filter = 
				{
					'type' : 'pokemon',
					'id' : id,
					'positive' : true
				};
				user.addRaidFilter(filter);
				return { 'msg' : "Raid filter added", "keyboard" : defaultKeyboard };
			}
			
			
			
   		}
   		else if(match[1] == 'remove')
		{
		
		}
		else if(match[1] == 'ignore')
		{
		
		}
   		
   		
   		
    	logger.info(util.inspect(match));
    
        return 'Sorry, this feature is not working yet. Please bother Johan about it';
    }

};
