"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function NewExpression(callee, args) {
        Node.call(this);
        this.type = "NewExpression";
        this.callee = callee;
        this.callee.parent = this;
        Object.defineProperty(this, "arguments", {
            value: args,
            enumerable: true
        });
        for (let arg of args) {
            arg.parent = this;
        }
    }
    NewExpression.prototype = Object.create(Node);
    NewExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.callee = this.callee.codegen();
        let args = this.arguments;
        let i = 0;
        for (let arg of args) {
            args[i] = arg.codegen();
            i++;
        }
        return this;
    };
    NewExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.NewExpression = NewExpression;
}());

//# sourceMappingURL=src/ast/expressions/NewExpression.map