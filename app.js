
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
 	app.use(express.errorHandler());
}else{
	app.use(function(err, req, res, next){
    	console.error(err.stack);
		res.render('general_error', {message: "解決できないエラーが発生しました。下記リンクからお問い合わせ下さい"});
	});
}
routes.wire(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('SiteCreator is ready at port: ' + app.get('port'));
});
