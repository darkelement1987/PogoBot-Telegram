'use strict';
/**
 * Start command
 * @module command/start
 */
module.exports = {

    /** Command name */
    name: '/help',

    /** Command regex pattern */
    pattern: /\/helphelphep/i,

    /** Command's description to be listed in /help */
    description: '/help - Shows you a list of commands with a description',

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
    }

};
