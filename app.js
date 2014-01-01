
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var cookie = require('cookie');
var MongoStore = require('connect-mongo')(express);
var websocket = require('socket.io');
var mongo = require('mongoskin');
var crypto = require('crypto');
var http = require('http');
var path = require('path');
var wsnamespaces = require('./wsnamespaces.js');

var app = express();

var database = {
    mongo: mongo.db('mongo://localhost:27017/?auto_reconnect=true', {
        database: 'music',
        safe: true
    })
};
var sessionStore = new MongoStore({db: 'music'});
var secretSession = 'dsdsadawdasdasdsad';
var sioCookieParser = express.cookieParser(secretSession);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.cookieParser());
app.use(express.session({ secret: secretSession, key: 'sid', store: sessionStore}));
app.use(express.compress());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

routes(app, database);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    var wsServer = websocket.listen(3001);
    wsServer.set('authorization', function (handshakeData, accept) {

        sioCookieParser(handshakeData, {}, function(err) {
            if (err) {
                console.log(err);
                return accept(null, true);
            }
            sessionStore.get(handshakeData.signedCookies['sid'], function(err, session) {
                if (err || !session){
                    console.log('Session error');
                    return accept(null, true);

                }
                handshakeData.session = session;
                //console.log(session);
                accept(null, true);
            });

        });
    }).on('connection', function(socket) {
        console.log("Connect socket!");
        wsnamespaces(socket, database);




    }).on('disconnect', function(socket) {
        console.log("Disconnect socket!");
    });
});

