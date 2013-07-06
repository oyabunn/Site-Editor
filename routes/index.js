
var _config;
var _view = require('./controllers/view.js');

exports.wire = function(app)
{
	_congig = require('../config/config.js').getConfig('dev');
	app.all ('/*', injector);
	
	app.get('/view/*', _view.view);
};

var injector = function (req, res, next){
	req.config = _config;
	next();
};