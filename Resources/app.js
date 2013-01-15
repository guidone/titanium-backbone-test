var Backbone = require('backbone');

var MyApp = {
    View: {},
    Model: {},
    Controller: {},
    API: {
        URL: 'http://localhost:3000',
    }
};

Backbone.sync = require('/lib/sync/sql').sync;

Ti.include('/model/post.js');
Ti.include('/view/main.js');

main = new MyApp.View.Main;
