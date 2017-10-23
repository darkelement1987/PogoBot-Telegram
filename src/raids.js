'use strict';

/**
 * Pokedex module
 * @module pokedex
 */

var fs = require('fs'),
    _ = require('lodash'),
    logger = require('winston'),
    util = require('util'),
    raids = JSON.parse(fs.readFileSync(__dirname + '/../locale/raids.json'));

/** Dictionary of known Pokémon */
exports.raids = raids;

