(function(ns, $) {
    "use strict";

    var has = Object.prototype.hasOwnProperty;

    var CriteriaMatcher = function(matchType, sourceProperty, matchAgainst) {
        this.sourceProperty = sourceProperty;

        this.matcher = {
            like: function(source) {
                return source.toLowerCase().indexOf(matchAgainst.toLowerCase()) !== -1;
            },
            eq: function(source) {
                return source == matchAgainst;
            },
            lazyEqual: function(source) {
                return source === matchAgainst;
            }
        }[matchType];
    };

    CriteriaMatcher.prototype = {
        getSourceProperty: function() {
            return this.sourceProperty;
        },
        match: function(source) {
            return this.matcher(source);
        }
    };

    CriteriaMatcher.type = {
        lazyEqual: "leq",
        equal: "eq",
        like: "like"
    };

    var SimpleEntityRepository = function(entities) {
        this.initialize(entities || {});

        this.dispatchEvent = function(event) {
            $(this).trigger(event, [].slice.call(arguments, 1));
        };
    };

    SimpleEntityRepository.prototype = {
        on: function(event, listener) {
            $(this).on(event, listener);
            return this;
        },
        initialize: function(entities) {
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
        count: function() {
            var count = 0;
            
            for(var id in this.entities) {
                if(has.call(this.entities, id)) count++;
            }
            
            return count;
        },
        findAll: function(limit) {
            var entities = [];
            var count = 0;

            for(var id in this.entities) {
                if(has.call(this.entities, id)) {
                    count++;
                    entities.push(this.entities[id]);
                    if(limit && count === limit) break;
                }
            }

            return entities;
        },
        find: function(id) {
            id = parseInt(id, 10);

            if(this.has(id)) {
                return this.entities[id];
            } else {
                throw "entity with id " + id + " not found";
            }
        },
        filter: function(criteria) {
            var result = [];
            var criteriaSources = [];
            var numberOfCriteria = criteria.length;

            for(var i = 0; i < numberOfCriteria; i++) {
                criteriaSources.push(criteria[i].getSourceProperty());
            }

            for(var id in this.entities) {
                if(has.call(this.entities, id)) {
                    var entity = this.entities[id];
                    var take = true;

                    for(var i = 0; i < numberOfCriteria; i++) {
                        if(!criteria[i].match(entity[criteriaSources[i]])) {
                            take = false;
                            break;
                        }
                    }
                    
                    if(take) {
                        result.push(entity);
                    }
                }
            }
            
            return result;
        },
        has: function(id) {
            return has.call(this.entities, id);
        },
        add: function(item) {
            this.entities[parseInt(item.id, 10)] = item;
            return this;
        },
        remove: function(id) {
            var item = this.find(id);
            delete this.entities[item.id];
            return this;
        }
    };

    var RemoteEntityRepository = function(entities, urlGenerator) {
        SimpleEntityRepository.call(this, urlGenerator);
        this.urlGenerator = urlGenerator;
    };

    RemoteEntityRepository.prototype = SimpleEntityRepository.prototype;

    RemoteEntityRepository.prototype = {
        remove: function(id, onRemoved) {
            var entity = this.find(id);
            var _self = this;

            onRemoved = onRemoved || function() {};

            this.dispatchEvent("entity:remove:execute", entity);

            $.ajax(this.urlGenerator.generate("remove", entity), {
                type: "DELETE"
            })
                .done(function() {
                    SimpleEntityRepository.call(this, id);
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

    ns.SimpleEntityRepository = SimpleEntityRepository;
    ns.RemoteEntityRepository = RemoteEntityRepository;
    ns.CriteriaMatcher = CriteriaMatcher;
})(org.farbdev.entity.repository, jQuery);
