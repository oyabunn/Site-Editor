
var _config;
var _path = require('path');

var _view =		require('./controllers/view.js');
var _creator =	require('./controllers/creator.js');
var _manager =	require('./controllers/manager.js');


exports.wire = function(app)
{
	_config = require('../config/config.js').getConfig('dev');
	app.all ('/*', injector);
	
	// view contents
	app.get ('/view/*',		_view.view);
	
	// edit contents
	app.get ('/edit/*',		_creator.showEditView);
	app.post('/save/*',		_creator.save);
	app.post('/publish/*',	_creator.publish);
	app.post('/upload',		_creator.fileReceiver);
	
	// manage contents
	app.get ('/manage/*',	_manager.manage);
	app.post('/manage/*',	_manager.create);
};

var injector = function (req, res, next){
	req.config = _config;
	next();
};