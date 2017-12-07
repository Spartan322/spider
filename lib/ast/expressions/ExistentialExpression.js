"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ExistentialExpression(argument) {
        Node.call(this);
        this.type = "ExistentialExpression";
        this.argument = argument;
        this.argument.parent = this;
    }
    ExistentialExpression.prototype = Object.create(Node);
    ExistentialExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let nullCoalescing0 = typeof this.argument.hasCallExpression === "function" ? this.argument.hasCallExpression() : void 0;
        let isArgumentCallExpression = nullCoalescing0 == null ? false : nullCoalescing0;
        this.argument = this.argument.codegen();
        if (isArgumentCallExpression) {
            let context = this.getContext();
            let id = {
                "type": "Identifier",
                "name": this.getNextVariableName("existential")
            };
            context.node.body.splice(context.position + (ExistentialExpression.existentialIndex - 2), 0, {
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": this.argument
                    }],
                "kind": "let",
                "codeGenerated": true
            });
            this.argument = id;
        }
        let nullCheck = {
            "type": "BinaryExpression",
            "operator": "!==",
            "left": this.argument,
            "right": { "type": "NullLiteral" }
        };
        this.type = "LogicalExpression";
        this.operator = "&&";
        this.left = {
            "type": "BinaryExpression",
            "operator": "!==",
            "left": {
                "type": "UnaryExpression",
                "operator": "typeof",
                "argument": this.argument,
                "prefix": true
            },
            "right": {
                "type": "StringLiteral",
                "value": "undefined",
                "extra": { "raw": "'undefined'" }
            }
        };
        this.right = nullCheck;
        return this;
    };
    ExistentialExpression.prototype.hasCallExpression = function () {
        let nullCoalescing1 = typeof this.argument !== "undefined" && this.argument !== null && typeof this.argument.hasCallExpression === "function" ? this.argument.hasCallExpression() : void 0;
        return nullCoalescing1 == null ? false : nullCoalescing1;
    };
    exports.ExistentialExpression = ExistentialExpression;
}());

//# sourceMappingURL=src/ast/expressions/ExistentialExpression.map