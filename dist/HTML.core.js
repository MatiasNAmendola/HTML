/*! HTML - v0.9.0 - 2013-07-18
* http://nbubna.github.io/HTML/
* Copyright (c) 2013 ESHA Research; Licensed MIT, GPL */
(function(window, document) {
    "use strict";

    var _ = {
        version: "0.9.0",
        slice: Array.prototype.slice,
        list: function(list) {
            if (list.isNodeList){ return list; }
            if (list.length === 1){ return _.node(list[0]); }
            list = _.slice.call(list);
            list.isNodeList = true;
            _.functions(list);
            return list;
        },
        node: function(node) {
            if (!node.isNode) {
                node.isNode = true;
                _.functions(node);
            }
            _.children(node);// make sure we're current
            return node;
        },
        functions: function(o) {
            for (var name in _.fn) {
                o[name] = _.fn[name].bind(o);
            }
        },
        children: function(node) {
            for(var i=0, m=node.childNodes.length, map={}; i<m; i++) {
                var child = node.childNodes[i],
                    type = _.type(child);
                (map[type]||(map[type]=[])).push(child);
            }
            Object.keys(map).forEach(function(key) {
                try {
                    Object.defineProperty(node, key, _.definition(map[key]));
                } catch (e) {}
            });
        },
        type: function(node) {
            return node.tagName ? node.tagName.toLowerCase() :
                   node.nodeType === 3 && node.textContent.trim() ? '_text' :
                   '_empty';
        },
        definition: function(children) {
            return {
                get: function(){ return _.list(children); },
                configurable: true
            };
        },
        fn: {
            each: function(fn) {
                var self = this.isNode ? [this] : this,
                    fields;
                if (typeof fn === "string") {
                    fields = [];
                    fn = _.field.apply(self, arguments);
                }
                self.forEach(function(el, i, arr) {
                    var ret = fn.call(self, _.node(el), i, arr);
                    if (fields && ret !== undefined) {
                        fields.push(ret);
                    }
                });
                return fields && fields.length ? fields : this;
            },
            find: function(selector) {
                var self = this.isNode ? [this] : this;
                for (var list=[],i=0,m=self.length; i<m; i++) {
                    list = list.concat(_.slice.call(self[i].querySelectorAll(selector)));
                }
                return _.list(list);
            },
            only: function(b, e) {
                var self = this.isNode ? [this] : this;
                return _.list(
                    b >= 0 || b < 0 ?
                        self.slice(b, e || (b + 1) || undefined) :
                        self.filter(
                            typeof b === "function" ? b :
                            function(el){ return el[_.matches](b); }
                        )
                );
            }
        },
        field: function(key) {
            var args = _.slice.call(arguments, 1);
            key = _.fn.each[key] || key;// e.g. _.fn.each['+class'] = 'classList.add';
            return function(el) {
                var prop = key, o = el;
                if (prop.indexOf('.') > 0) {
                    var props = prop.split('.');
                    while (props.length > 1 && (o = o[prop = props.shift()])){}
                    o = o || el;
                    prop = o ? props[0] : key;
                }
                var val = o[prop];
                if (val !== undefined) {
                    if (typeof val === "function") { return val.apply(o, args); }
                    else if (args.length) { o[prop] = args[0]; }
                    else { return val; }
                }
                else if (args.length) { el.setAttribute(key, args[0]); }
                else { return el.getAttribute(key); }
            };
        }
    };

    var HTML = _.node(document.documentElement);// early, for use in head
    HTML._ = _;
    ['m','webkitM','mozM','msM'].forEach(function(prefix) {
        if (HTML[prefix+'atchesSelector']) {
            _.matches = prefix+'atchesSelector';
        }
    });
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HTML;
    } else {
        window.HTML = HTML;
    }
    // again, for use in body
    document.addEventListener("DOMContentLoaded", function(){ _.node(HTML); });

})(window, document);
