"use strict";
(function () {
    let Node = module.require("../Node").Node, UndefinedLiteral = module.require("../literals/UndefinedLiteral").UndefinedLiteral;
    function ConditionalExpression(test, consequent, alternate) {
        Node.call(this);
        this.type = "ConditionalExpression";
        this.test = test;
        this.test.parent = this;
        this.consequent = consequent;
        this.consequent.parent = this;
        this.alternate = alternate;
        if (typeof this.alternate !== "undefined" && this.alternate !== null) {
            this.alternate.parent = this;
        }
    }
    ConditionalExpression.prototype = Object.create(Node);
    ConditionalExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.test = this.test.codegen();
        this.consequent = this.consequent.codegen();
        if (!(typeof this.alternate !== "undefined" && this.alternate !== null)) {
            this.alternate = new UndefinedLiteral();
            this.alternate.parent = this;
        }
        this.alternate = this.alternate.codegen();
        return this;
    };
    ConditionalExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ConditionalExpression = ConditionalExpression;
}());

//# sourceMappingURL=src/ast/expressions/ConditionalExpression.map