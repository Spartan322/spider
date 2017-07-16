"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ObjectExpression(properties) {
        Node.call(this);
        this.type = "ObjectExpression";
        this.properties = properties;
        for (let property of this.properties) {
            property.parent = this;
        }
    }
    ObjectExpression.prototype = Object.create(Node);
    ObjectExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        for (let property of this.properties) {
            this.properties[i] = property.codegen();
            i++;
        }
        return this;
    };
    ObjectExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ObjectExpression = ObjectExpression;
}());

//# sourceMappingURL=src/ast/expressions/ObjectExpression.map