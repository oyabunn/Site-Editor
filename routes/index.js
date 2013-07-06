
var _config;
var _view = require('./controllers/view.js');
var _creator = require('./controllers/creator.js');

exports.wire = function(app)
{
	_congig = require('../config/config.js').getConfig('dev');
	app.all ('/*', injector);
	
	app.get ('/view/*',		_view.view);
	app.get ('/output/*',	_view.outputView);
	app.get ('/edit/*',		_creator.showEditView);
};

var injector = function (req, res, next){
	req.config = _config;
	next();
};