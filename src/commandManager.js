'use strict';

var User = require('./user'),
    util = require('util'),
    logger = require('winston'),
    commands = require('./commands');

/**
 * Command Manager.
 * @module commandManager
 */
module.exports = function(config, bot, listener) {

    /** Help command is special; lists the descriptions of all other commands */
    bot.onText(/\/help/i, function(msg) {
        bot.sendMessage(
            msg.from.id,
            'Hello! I am PogoBot, and alert you of nearby Pokémon!\n\n' +
            'The following commands are available to you:\n' +
            commandDescriptions() + '\n' +
            '/help - Display this message'
        );
    });

    /** Enable all commands found in src/commands */
    commands.map(function(command) {
        bot.onText(command.pattern, function(msg, match) {
            User.findOrCreate({ telegramId: msg.from.id }, function(err, user, created) {
                if (err) {
                    config.logger.error(err);
                    return;
                }

                var replyMessage = command.callback(msg, match, user, created, listener);

				var keyboard = generateReplyKeyboard(user);
		
//		logger.info(util.inspect(keyboard));
		


                // Send the generated reply message and update reply keyboard
				if (replyMessage) {
		    	    if((typeof replyMessage) == "string")
		    	    {
					}
					else if(Array.isArray(replyMessage))
					{
					    for(var i = 0; i < replyMessage.length-1; i++)
		        	        bot.sendMessage(msg.from.id, replyMessage[i]);
					    replyMessage = replyMessage[replyMessage.length-1];
					}
					else if(replyMessage.msg)
					{
					    if(replyMessage.keyboard)
							keyboard = replyMessage.keyboard;
					    replyMessage = replyMessage.msg;
					}
					else
					    config.logger.info("reply Type: " + typeof replyMessage);



		            bot.sendMessage(msg.from.id, replyMessage, {
		            	reply_markup: {
		                    keyboard: keyboard 
                        }
                    });
                }
            });
        });
    });
    
    
    bot.on('message', function(msg)
    {
    	listener.emit('message', msg);
    });

    /** Returns all commands that have list: true */
    function generateReplyKeyboard(user) {
        var enabledCommandNames = commands.filter(function(command) {
            // Get enabled commands
            if (typeof command.list === 'function') {
                return command.list(user);
            }
            else return !!command.list;
        }).map(function(command) {
            // Construct Telegram API KeyboardButton objects
            return [{ text: command.name } ];
        });

	for(var i = 0; i < enabledCommandNames.length-1; i++)
	{
	    enabledCommandNames[i].push(enabledCommandNames[i+1][0]);
	    enabledCommandNames.splice(i+1,1);
	}

        return enabledCommandNames;
    }

    /** Lists the descriptions for all available commands */
    function commandDescriptions() {
        return commands.reduce(function(previous, current) {
	    if(current.hidden)
		return previous;
            return previous + '\n' + current.description;
        }, '');
    }
};

