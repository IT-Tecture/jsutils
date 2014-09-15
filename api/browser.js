(function(ns, $) {
    var Browser = function(browsePath, searchForm) {
        var _self = this;

        this.browsePath = browsePath;
        this.searchForm = searchForm;
        this.currentSearchRequest = false;

        this.dispatchEvent = function(event) {
            $(this).trigger(event, [].slice.call(arguments, 1));
        };

        this.searchForm.on("submit", function(event) {
            event.stopPropagation();
            event.preventDefault();

            _self.search();
        });

        this.searchForm
            .on("change", "[name]", function() {
                _self.dispatchEvent("browser:form:submit", this);
                _self.searchForm.submit();
            })
            .on("keydown", "[name]", function(event) {
                if(event.keyCode === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).trigger("blur");
                }
            })
        ;
    };

    Browser.prototype = {
        on: function(event, listener) {
            $(this).on(event, listener);
            return this;
        },
        reset: function() {
            this.dispatchEvent("browser:reset");

            this.searchForm.find("input, select").each(function() {
                $(this).val(null);
            });

            this.search();
            this.activateSearch();

            return this;
        },
        activateSearch: function() {
            // TODO unimplemented

            this.dispatchEvent("browser:form:activated");
        },
        deactivateSearch: function() {
            // TODO unimplemented

            this.dispatchEvent("browser:form:activated");
        },
        search: function(data) {
            var _self = this;

            this.dispatchEvent("browser:search:start");

            data = data || this.searchForm.serialize();

            this.deactivateSearch();

            if(this.currentSearchRequest) {
                this.currentSearchRequest.abort();
            }

            this.currentSearchRequest = $.getJSON(this.browsePath, data, function(data) {
                _self.dispatchEvent("browser:search:complete", data);
                _self.activateSearch();
                _self.currentSearchRequest = false;
            });
        }
    };

    ns.Browser = Browser;
})(org.farbdev.api, jQuery);
