"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function JavascriptLiteralExpression(raw) {
        Node.call(this);
        this.type = "JavascriptExpression";
        this["JavascriptLiteralExpression"] = raw;
    }
    JavascriptLiteralExpression.prototype = Object.create(Node);
    JavascriptLiteralExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    JavascriptLiteralExpression.prototype.hasCallExpression = function () {
        return false;
    };
    exports.JavascriptLiteralExpression = JavascriptLiteralExpression;
}());

//# sourceMappingURL=src/ast/expressions/JavascriptLiteralExpression.map