"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function NullLiteral() {
        Node.call(this);
        this.type = "NullLiteral";
    }
    NullLiteral.prototype = Object.create(Node);
    NullLiteral.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    NullLiteral.prototype.hasCallExpression = function () {
        return false;
    };
    exports.NullLiteral = NullLiteral;
}());

//# sourceMappingURL=src/ast/literals/NullLiteral.map