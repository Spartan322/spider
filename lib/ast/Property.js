"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function Property(key, value, shorthand, method) {
        Node.call(this);
        this.type = method ? "ObjectMethod" : "ObjectProperty";
        this.kind = method ? "method" : "init";
        this.method = method;
        this.shorthand = shorthand;
        this.computed = false;
        this.key = key;
        this.key.parent = this;
        this.value = value;
        this.value.parent = this;
    }
    Property.prototype = Object.create(Node);
    Property.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.key = this.key.codegen(false);
        this.value = this.shorthand ? this.key : this.value.codegen(this.parent.type !== "ObjectPattern");
        if (this.method) {
            this.params = this.value.params;
            this.body = this.value.body;
            this.id = null;
            delete this.value;
        }
        return this;
    };
    Property.prototype.hasCallExpression = function () {
        return this.value.hasCallExpression();
    };
    exports.Property = Property;
}());

//# sourceMappingURL=src/ast/Property.map