MyApp.View.Main = Backbone.View.extend({
    initialize: function() {
        this.window = Ti.UI.createWindow({
          navBarHidden: true
        });
        this.label = Ti.UI.createLabel({
          text: 'Welcome to backbone.ti',
          color: '#CCCCCC'
        });
        this.window.add(this.label);
        this.window.open();

        var post = new MyApp.Model.Post();
        var postList = new MyApp.Collection.PostList();

        post.save({body: 'aiueo'});

        // postList.fetch({
            // success: function(collection, response, options) { 
                // collection.each(function(post) {
                    // alert(post.get('id'));
                    // alert(post.get('body'));
                // });
            // }, 
            // error: function() { alert('error'); }
        // });
    }
});
