"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function NumberLiteral(text) {
        Node.call(this);
        this.type = "NumericLiteral";
        this.value = Number(text);
        this.extra = { raw: text };
    }
    NumberLiteral.prototype = Object.create(Node);
    NumberLiteral.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    NumberLiteral.prototype.hasCallExpression = function () {
        return false;
    };
    exports.NumberLiteral = NumberLiteral;
}());

//# sourceMappingURL=src/ast/literals/NumberLiteral.map