MyApp.Model.Post = Backbone.Model.extend({

    config: {
        "columns": {
            "body": 'string'
        },
        "adapter": {
            "collection_name": 'post'
        }
    },

    urlRoot: MyApp.API.URL + "/posts",

    defaults: {
        body: 'hoge'
    }
});
