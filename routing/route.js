(function(ns) {
    var Route = function(name, template) {
        this.name = name;
        this.template = template;

        this.getVariables = function() {
            var finder = /(__(\w+)__)/gi;
            var matches = {};
            var match;

            while((match = finder.exec(this.template)) !== null) {
                matches[match[0]] = match[2];
            }

            return matches;
        };
    };

    Route.prototype = {
        render: function(values) {
            var variables = this.getVariables();
            var template = this.template;

            for(var replace in variables) {
                var objectProperty = variables[replace];

                if(!values.hasOwnProperty(objectProperty)) {
                    throw "missing route parameter '" + objectProperty + "'";
                }

                template = template.replace(replace, values[objectProperty]);
            }

            return template;
        }
    };

    ns.Route = Route;
})(org.farbdev.routing);
