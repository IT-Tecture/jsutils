(function(ns, $, Handlebars) {
    var Paginator = function(controls) {
        var _self = this;

        this.totalPages = 1;
        this.currentPage = 1;
        this.controls = controls;
        this.templates = {
            selectorItem: Handlebars.compile("<li><a data-page-number='{{ page }}' href='#'>{{ page }} / {{ totalPages }}</a></li>")
        };

        this.controls.next.on("click", function() {
            _self.gotoNextPage();
        });

        this.controls.previous.on("click", function() {
            _self.gotoPreviousPage();
        });

        this.controls.selector.on("click", "a", function() {
            _self.setPage($(this).attr("data-page-number"));
        });
    };

    Paginator.prototype = {
        setPage: function(page, quiet) {
            page = parseInt(page, 10);

            this.currentPage = page;
            this.controls.currentPage.val(page);

            this.render();

            if(!quiet) {
                this.controls.currentPage.trigger("change");
            }
        },
        gotoPreviousPage: function() {
            this.setPage(this.currentPage - 1);
        },
        gotoNextPage: function() {
            this.setPage(this.currentPage + 1);
        },
        render: function(totalPages) {
            this.totalPages = typeof totalPages !== "undefined" ? totalPages : this.totalPages;

            if(typeof totalPages !== "undefined") {
                this.controls.selector.empty();

                for(var i = 1; i <= totalPages; i++) {
                    this.controls.selector.append(
                        this.templates.selectorItem({
                            totalPages: totalPages,
                            page: i
                        })
                    );
                }
            }

            var currentPage = this.totalPages > 0 ? this.currentPage : 0;

            this.controls.previous
                .prop("disabled", currentPage <= 1);

            this.controls.next
                .prop("disabled", currentPage === this.totalPages);

            this.controls.counter
                .prop("disabled", this.totalPages === 0)
                .text(currentPage + " / " + this.totalPages);
        }
    };

    ns.Paginator = Paginator;
})(org.farbdev.view, jQuery, Handlebars);
