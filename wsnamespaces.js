/**
 * Created by Sanek on 31.12.13.
 */

var customEvents = {
    guest: {
        default: function() {
            console.log('I am guest and connected');
        }
    },
    user: {
        default: function() {
            console.log('I am user and connected');
        }

    },
    admin: {
        default: function() {
            console.log('I am admin and connected');
        }

    }

};

module.exports = function (socket, database) {
    "use strict";
    for (var i = socket.handshake.session.roles.length - 1; i >= 0; i--) {
        var role = socket.handshake.session.roles[i];
        if (customEvents[role]['default'] && typeof(customEvents[role]['default']) === 'function') {
            customEvents[role]['default']();
        }
        for (var event in customEvents[role]) {
            if (event !== 'connection' && event !== 'default' && typeof(customEvents[role][event]) === 'function') {
                socket.on(event, customEvents[role][event]);
            }
        }
    }
};