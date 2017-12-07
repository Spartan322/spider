"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function InExpression(left, right) {
        Node.call(this);
        this.type = "InExpression";
        this.left = left;
        this.left.parent = this;
        this.right = right;
        this.right.parent = this;
    }
    InExpression.prototype = Object.create(Node);
    InExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.left = this.left.codegen();
        this.right = this.right.codegen();
        if (typeof this.right.hasCallExpression === "function" ? this.right.hasCallExpression() : void 0) {
            let context = this.getContext();
            let id = {
                "type": "Identifier",
                "name": this.getNextVariableName("inExpression"),
                "codeGenerated": true
            };
            context.node.body.splice(context.position + (InExpression.inExpressionIndex - 2), 0, {
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": this.right
                    }],
                "kind": "let",
                "codeGenerated": true
            });
            this.right = id;
        }
        this.type = "ConditionalExpression";
        this.test = {
            "type": "BinaryExpression",
            "operator": "instanceof",
            "left": this.right,
            "right": {
                "type": "Identifier",
                "name": "Array"
            }
        };
        this.consequent = {
            "type": "BinaryExpression",
            "operator": "!==",
            "left": {
                "type": "CallExpression",
                "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": this.right,
                    "property": {
                        "type": "Identifier",
                        "name": "indexOf"
                    }
                },
                "arguments": [this.left]
            },
            "right": {
                "type": "UnaryExpression",
                "operator": "-",
                "argument": {
                    "type": "NumericLiteral",
                    "value": 1,
                    "extra": { "raw": "1" }
                },
                "prefix": true
            }
        };
        this.alternate = {
            "type": "BinaryExpression",
            "operator": "in",
            "left": this.left,
            "right": this.right
        };
        return this;
    };
    InExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.InExpression = InExpression;
}());

//# sourceMappingURL=src/ast/expressions/InExpression.map