"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ArrayExpression(elements) {
        Node.call(this);
        this.type = "ArrayExpression";
        this.elements = elements;
        for (let element of this.elements) {
            if (typeof element !== "undefined" && element !== null) {
                element.parent = this;
            }
        }
    }
    ArrayExpression.prototype = Object.create(Node);
    ArrayExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        for (let element of this.elements) {
            this.elements[i] = typeof element !== "undefined" && element !== null ? element.codegen() : void 0;
            i++;
        }
        return this;
    };
    ArrayExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ArrayExpression = ArrayExpression;
}());

//# sourceMappingURL=src/ast/expressions/ArrayExpression.map