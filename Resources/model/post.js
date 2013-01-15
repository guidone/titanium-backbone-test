MyApp.Model.Post = Backbone.Model.extend({
    columns: {
        "body": 'string'
    }
});

MyApp.Collection.PostList = Backbone.Collection.extend({
    table_name: 'post',
    model : MyApp.Model.Post
});
