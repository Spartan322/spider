"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function BooleanLiteral(text) {
        Node.call(this);
        this.type = "BooleanLiteral";
        this.value = text === "true";
        this.extra = { raw: text };
    }
    BooleanLiteral.prototype = Object.create(Node);
    BooleanLiteral.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    BooleanLiteral.prototype.hasCallExpression = function () {
        return false;
    };
    exports.BooleanLiteral = BooleanLiteral;
}());

//# sourceMappingURL=src/ast/literals/BooleanLiteral.map