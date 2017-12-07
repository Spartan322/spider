"use strict";
(function () {
    let Node = module.require("../Node").Node, Identifier = module.require("../literals/Identifier").Identifier, NullCoalescingExpression = module.require("./NullCoalescingExpression").NullCoalescingExpression;
    function AssignmentExpression(left, operator, right) {
        Node.call(this);
        this.type = "AssignmentExpression";
        this.operator = operator;
        this.left = left;
        this.left.parent = this;
        this.right = right;
        this.right.parent = this;
    }
    AssignmentExpression.prototype = Object.create(Node);
    AssignmentExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (this.operator === "?=") {
            this.right = new NullCoalescingExpression(this.left, this.right, false);
            this.right.parent = this;
            this.operator = "=";
        }
        if (this.right.type !== "NullCoalescingExpression") {
            this.left = this.left.codegen();
            this.right = this.right.codegen();
        } else {
            this.right = this.right.codegen(false);
        }
        return this;
    };
    AssignmentExpression.prototype.hasCallExpression = function () {
        return !!(typeof this.left !== "undefined" && this.left !== null ? this.left.hasCallExpression() : void 0) || !!(typeof this.right !== "undefined" && this.right !== null ? this.right.hasCallExpression() : void 0);
    };
    exports.AssignmentExpression = AssignmentExpression;
}());

//# sourceMappingURL=src/ast/expressions/AssignmentExpression.map