"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ThisExpression() {
        Node.call(this);
        this.type = "ThisExpression";
    }
    ThisExpression.prototype = Object.create(Node);
    ThisExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    ThisExpression.prototype.hasCallExpression = function () {
        return false;
    };
    exports.ThisExpression = ThisExpression;
}());

//# sourceMappingURL=src/ast/expressions/ThisExpression.map