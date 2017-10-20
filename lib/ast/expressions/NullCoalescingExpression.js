"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function NullCoalescingExpression(left, right) {
        Node.call(this);
        this.type = "NullCoalescingExpression";
        this.left = left;
        this.left.parent = this;
        this.right = right;
        this.right.parent = this;
    }
    NullCoalescingExpression.prototype = Object.create(Node);
    NullCoalescingExpression.prototype.codegen = function (ignoreUndefined = false) {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let leftType = this.left.type;
        this.left = this.left.codegen();
        this.right = this.right.codegen();
        let context = this.getContext();
        let addUndefinedCheck = !ignoreUndefined;
        if (!!(!!(leftType === "NullPropagatingExpression") || !!(leftType === "NullCoalescingExpression")) || !!(typeof this.left.hasCallExpression === "function" ? this.left.hasCallExpression() : void 0)) {
            let id = {
                "type": "Identifier",
                "name": this.getNextLeftName()
            };
            context.node.body.splice(context.position, 0, {
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": this.left
                    }],
                "kind": "let",
                "codeGenerated": true
            });
            this.left = id;
            addUndefinedCheck = false;
        }
        let test = {
            "type": "BinaryExpression",
            "operator": "==",
            "left": this.left,
            "right": { "type": "NullLiteral" }
        };
        if (this.left.type !== "Identifier") {
            addUndefinedCheck = false;
        }
        if (addUndefinedCheck) {
            test = {
                "type": "LogicalExpression",
                "operator": "||",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "===",
                    "left": {
                        "type": "UnaryExpression",
                        "operator": "typeof",
                        "argument": this.left,
                        "prefix": true
                    },
                    "right": {
                        "type": "StringLiteral",
                        "value": "undefined",
                        "extra": {
                            "rawValue": "undefined",
                            "raw": "\"undefined\""
                        }
                    }
                },
                "right": test
            };
        }
        if ((typeof this.parent !== "undefined" && this.parent !== null ? this.parent.type : void 0) === "ExpressionStatement") {
            if (!this.right.hasCallExpression()) {
                this.parent.type = "EmptyStatement";
                return this;
            }
            this.parent.type = "IfStatement";
            this.parent.test = test;
            this.parent.consequent = {
                "type": "BlockStatement",
                "body": [{
                        "type": "ExpressionStatement",
                        "expression": this.right
                    }]
            };
        } else {
            return {
                "type": "ConditionalExpression",
                "test": test,
                "consequent": this.right,
                "alternate": this.left
            };
        }
    };
    NullCoalescingExpression.prototype.hasCallExpression = function () {
        return !!(typeof this.left !== "undefined" && this.left !== null ? this.left.hasCallExpression() : void 0) || !!(typeof this.right !== "undefined" && this.right !== null ? this.right.hasCallExpression() : void 0);
    };
    NullCoalescingExpression.prototype.getNextLeftName = function () {
        if (!(typeof NullCoalescingExpression.nullCoalescingIndex !== "undefined" && NullCoalescingExpression.nullCoalescingIndex !== null)) {
            NullCoalescingExpression.nullCoalescingIndex = 0;
        }
        let result = "nullCoalescing" + NullCoalescingExpression.nullCoalescingIndex;
        while (this.isIdentifierDefined(result = "nullCoalescing" + NullCoalescingExpression.nullCoalescingIndex++)) {
        }
        return result;
    };
    NullCoalescingExpression.resetVariableNames = function () {
        this.nullCoalescingIndex = 0;
    };
    exports.NullCoalescingExpression = NullCoalescingExpression;
}());

//# sourceMappingURL=src/ast/expressions/NullCoalescingExpression.map