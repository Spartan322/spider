"use strict";
(function () {
    let Node = module.require("../Node").Node, babel = module.require("babel-core");
    function JavascriptLiteralExpression(raw) {
        Node.call(this);
        this.type = "JavascriptExpression";
        this.raw = raw;
    }
    JavascriptLiteralExpression.prototype = Object.create(Node);
    JavascriptLiteralExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.type = "EmptyStatement";
        let n = this.getContext().node;
        if (!n.body) {
            n.body = [];
        }
        n.body.concat(babel.transform(this.raw, { code: false }).ast.program.body);
        return this;
    };
    JavascriptLiteralExpression.prototype.hasCallExpression = function () {
        return false;
    };
    exports.JavascriptLiteralExpression = JavascriptLiteralExpression;
}());

//# sourceMappingURL=src/ast/expressions/JavascriptLiteralExpression.map