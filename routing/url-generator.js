(function(ns) {
    var UrlGenerator = function(linkSpec) {
        this.linkSpec = linkSpec;
    };

    UrlGenerator.prototype = {
        generate: function(routeName, values) {
            if(!this.linkSpec.hasOwnProperty(routeName)) {
                throw "no route defined with name: " + routeName;
            }

            var route = new org.farbdev.routing.Route(routeName, this.linkSpec[routeName]);
            return route.render(values);
        }
    };

    ns.UrlGenerator = UrlGenerator;
})(org.farbdev.routing);
