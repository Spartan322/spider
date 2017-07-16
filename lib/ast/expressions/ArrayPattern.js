"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ArrayPattern(elements) {
        Node.call(this);
        this.type = "ArrayPattern";
        this.elements = elements;
        for (let element of this.elements) {
            if (typeof element !== "undefined" && element !== null) {
                element.parent = this;
            }
        }
    }
    ArrayPattern.prototype = Object.create(Node);
    ArrayPattern.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let context = this.getContext().node;
        let i = 0;
        for (let element of this.elements) {
            this.elements[i] = typeof element !== "undefined" && element !== null ? element.codegen(false) : void 0;
            if (!!(typeof element !== "undefined" && element !== null) && !!(element.type === "Identifier")) {
                context.defineIdentifier(element);
            }
            i++;
        }
        return this;
    };
    ArrayPattern.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ArrayPattern = ArrayPattern;
}());

//# sourceMappingURL=src/ast/expressions/ArrayPattern.map