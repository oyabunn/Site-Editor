
var _config = require('./config.json');

exports.getConfig = function(env){
    return _config[env];
};