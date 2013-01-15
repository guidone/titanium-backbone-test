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

        post.save(
            {body: 'moge'}, 
            {
                success: function() { alert(post.get('body')); }, 
                error: function() { alert('error'); }
            }
        );
    }
});
