(function(ns, $) {
    var EntityRepository = function(entities, urlGenerator) {
        this.initialize(entities || {}, urlGenerator || null);

        this.dispatchEvent = function(event) {
            $(this).trigger(event, [].slice.call(arguments, 1));
        };
    };

    EntityRepository.prototype = {
        on: function(event, listener) {
            $(this).on(event, listener);
            return this;
        },
        initialize: function(entities, urlGenerator) {
            this.urlGenerator = urlGenerator;
            this.entities = entities instanceof Array ?
                (function(items) {
                    var entities = {};

                    for(var i = 0, ii = items.length; i < ii; i++) {
                        entities[parseInt(items[i].id, 10)] = items[i];
                    }

                    return entities;
                })(entities)
                : entities
            ;
        },
        find: function(id) {
            id = parseInt(id);

            if(this.entities.hasOwnProperty(id)) {
                return this.entities[id];
            } else {
                throw "entity with id " + id + " not found";
            }
        },
        remove: function(id, onRemoved) {
            var entity = this.find(id);
            var _self = this;

            onRemoved = onRemoved || function() {};

            this.dispatchEvent("entity:remove:execute", entity);

            $.ajax(this.urlGenerator.generate("remove", entity), {
                type: "DELETE"
            })
                .done(function() {
                    delete _self.entities[entity.id];
                    onRemoved(true);
                    _self.dispatchEvent("entity:remove:success", entity);
                })
                .fail(function(xhr, status, error) {
                    onRemoved(false, {
                        entity: entity,
                        message: error
                    });
                    _self.dispatchEvent("entity:remove:failure", entity, error);
                })
            ;
        },
        update: function(id, data, onUpdated) {
            var entity = this.find(id);
            var _self = this;

            onUpdated = onUpdated || function() {};

            this.dispatchEvent("entity:update:execute", entity);

            $.ajax(this.urlGenerator.generate("update", entity), {
                type: "PUT",
                data: data
            })
                .done(function() {
                    onUpdated(true);
                    _self.dispatchEvent("entity:update:success", entity);
                })
                .fail(function(xhr, status, error) {
                    onUpdated(false, {
                        entity: entity,
                        message: error
                    }, $.parseJSON(xhr.responseText));
                    _self.dispatchEvent("entity:update:failure", entity, error);
                })
            ;
        },
        refresh: function(id, onRefreshed) {
            var entity = this.find(id);
            var _self = this;

            onRefreshed = onRefreshed || function() {};

            this.dispatchEvent("entity:refresh:execute", entity);

            $.ajax(this.urlGenerator.generate("get", entity), {
                type: "GET"
            })
                .done(function(data) {
                    _self.entities[data.id] = data;
                    onRefreshed(true, {
                        entity: data
                    });
                    _self.dispatchEvent("entity:refresh:success", data);
                })
                .fail(function(xhr, status, error) {
                    onRefreshed(false, {
                        entity: entity,
                        message: error
                    });
                    _self.dispatchEvent("entity:refresh:failure", entity, error);
                })
            ;
        }
    };

    ns.EntityRepository = EntityRepository;
})(org.farbdev.entity.repository, jQuery);
