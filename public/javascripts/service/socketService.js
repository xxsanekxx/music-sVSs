/**
 * Created by sanek on 28.12.13.
 */
angular.module('socketService',[]).factory('socket', function($location, $rootScope){
    var serverAddress = 'localhost',
        serverPort = '3001',
        serverNS = '';

    var sio = io.connect('http://'+serverAddress+':'+serverPort+"/"+serverNS, {});

    return {
        on: function (eventName, callback) {
            sio.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(sio, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            sio.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(sio, args);
                    }
                });

            });
        },
        disconnect: function() {
            sio.disconnect();
        },
        reconnect: function() {
            //sio.on('reconnect', callback);
            sio.disconnect();
            sio.socket.reconnect();
        }
    };
});