"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function UndefinedLiteral() {
        Node.call(this);
        this.type = "UndefinedLiteral";
    }
    UndefinedLiteral.prototype = Object.create(Node);
    UndefinedLiteral.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.type = "UnaryExpression";
        this.operator = "void";
        this.argument = {
            "type": "NumericLiteral",
            "value": 0,
            "raw": "0"
        };
        this.prefix = true;
        return this;
    };
    UndefinedLiteral.prototype.hasCallExpression = function () {
        return false;
    };
    exports.UndefinedLiteral = UndefinedLiteral;
}());

//# sourceMappingURL=src/ast/literals/UndefinedLiteral.map