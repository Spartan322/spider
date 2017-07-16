"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ObjectPattern(properties) {
        Node.call(this);
        this.type = "ObjectPattern";
        this.properties = properties;
        for (let property of this.properties) {
            property.parent = this;
        }
    }
    ObjectPattern.prototype = Object.create(Node);
    ObjectPattern.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let context = this.getContext().node;
        let i = 0;
        for (let property of this.properties) {
            this.properties[i] = property.codegen();
            if (typeof property.value !== "undefined" && property.value !== null) {
                if (property.value.type === "Identifier") {
                    context.defineIdentifier(property.value);
                }
            } else {
                if (property.key.type === "Identifier") {
                    context.defineIdentifier(property.key);
                }
            }
            i++;
        }
        return this;
    };
    ObjectPattern.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ObjectPattern = ObjectPattern;
}());

//# sourceMappingURL=src/ast/expressions/ObjectPattern.map