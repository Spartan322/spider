"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ExpressionStatement(expression) {
        Node.call(this);
        this.type = "ExpressionStatement";
        this.expression = expression;
        this.expression.parent = this;
    }
    ExpressionStatement.prototype = Object.create(Node);
    ExpressionStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.expression = this.expression.codegen();
        return this;
    };
    exports.ExpressionStatement = ExpressionStatement;
}());

//# sourceMappingURL=src/ast/statements/ExpressionStatement.map