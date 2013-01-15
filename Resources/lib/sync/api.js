//Customise Backbone.sync to work with Titanium rather than jQuery
var getUrl = function(object) {
  if (!(object && object.url)) return null;
  return _.isFunction(object.url) ? object.url() : object.url;
};

Backbone.sync = (function() {    
    var methodMap = {
        'create': 'POST',
        'read'  : 'GET',
        'update': 'PUT',
        'delete': 'DELETE'
    };

    return function(method, model, options) {
        var xhr = Ti.Network.createHTTPClient({ timeout: 35000 });
        
        var type = methodMap[method],
            params = _.extend({}, options);


        //==== Start standard Backbone.sync code ====
        // Ensure that we have a URL
        if (!params.url) params.url = getUrl(model) || urlError();

        // Ensure that we have the appropriate request data.
        // if (!params.data && model && (method == 'create' || method == 'update')) {
          // params.data = model.toParams();
        // }
        
        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Backbone.emulateJSON) {
          params.contentType = 'application/x-www-form-urlencoded';
          params.processData = true;
          params.data        = params.data ? {model : params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Backbone.emulateHTTP) {
          if (type === 'PUT' || type === 'DELETE') {
            if (Backbone.emulateJSON) params.data._method = type;
            params.type = 'POST';
            params.beforeSend = function(xhr) {
              xhr.setRequestHeader('X-HTTP-Method-Override', type);
            };
          }
        }

        //==== End standard Backbone.sync code ====


        //Handle success
        xhr.onload = function() {                
          var cookies = this.getResponseHeader('Set-Cookie');
          if(cookies != null && Ti.Android)
            Ti.App.Properties.setString('cookies', cookies);

          params.success(JSON.parse(this.responseText));
        };

        //Handle error
        xhr.onerror = params.error;

        //Prepare the request
        xhr.open(type, params.url);

        //Add request headers etc.
        if(params.contentType)
          xhr.setRequestHeader('Content-Type', params.contentType);
        xhr.setRequestHeader('Accept', 'application/json');
        if (params.beforeSend) params.beforeSend(xhr);

        if(Ti.Android && Ti.App.Properties.getString('cookies'))
          xhr.setRequestHeader('Cookie', Ti.App.Properties.getString('cookies'));

        //Make the request
        xhr.send(params.data);
    };
})();

