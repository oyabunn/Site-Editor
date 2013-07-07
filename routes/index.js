
var _config;
var _view = require('./controllers/view.js');
var _creator = require('./controllers/creator.js');
var _path = require('path');

exports.wire = function(app)
{
	_config = require('../config/config.js').getConfig('dev');
	app.all ('/*', injector);
	
	app.get ('/view/*',		_view.view);
	
	app.get ('/edit/*',		_creator.showEditView);
	app.post('/save/*',		_creator.save);
	app.post('/publish/*',	_creator.publish);
	
	app.post('/upload',		_creator.fileReceiver);
};

var injector = function (req, res, next){
	req.config = _config;
	next();
};