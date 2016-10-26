let getbabelRelayPlugin = require('babel-relay-plugin');
let schema = require('../data/schema.json');

module.exports = getbabelRelayPlugin(schema.data);