"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function NullPropagatingExpression(left, right) {
        Node.call(this);
        this.type = "NullPropagatingExpression";
        this.computed = false;
        this.object = left;
        this.object.parent = this;
        this.property = right;
        this.property.parent = this;
    }
    NullPropagatingExpression.prototype = Object.create(Node);
    NullPropagatingExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let context = this.getContext();
        let childType = this.object.type;
        this.object = this.object.codegen();
        this.property = this.property.codegen(false);
        if (typeof this.object.hasCallExpression === "function" ? this.object.hasCallExpression() : void 0) {
            let id = {
                "type": "Identifier",
                "name": this.getNextVariableName("nullPropagating"),
                "__member_expression": {
                    "type": "MemberExpression",
                    "object": this.object,
                    "property": this.property,
                    "computed": false
                }
            };
            context.node.body.splice(context.position + (this.getVariableName("nullPropagating") - 1), 0, {
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": this.object
                    }],
                "kind": "let",
                "codeGenerated": true
            });
            this.object = id;
        }
        let condition;
        if (childType !== "NullPropagatingExpression") {
            condition = {
                "type": "BinaryExpression",
                "operator": "!==",
                "left": this.object,
                "right": { "type": "NullLiteral" },
                "__member_expression": {
                    "type": "MemberExpression",
                    "object": this.object,
                    "property": this.property,
                    "computed": false
                },
                "__first_object": this.object
            };
        } else {
            condition = {
                "type": "LogicalExpression",
                "operator": "&&",
                "left": this.object,
                "right": {
                    "type": "BinaryExpression",
                    "operator": "!==",
                    "left": {
                        "type": "MemberExpression",
                        "object": this.object.__member_expression.object,
                        "property": this.object.__member_expression.property,
                        "computed": false
                    },
                    "right": { "type": "NullLiteral" }
                },
                "__member_expression": {
                    "type": "MemberExpression",
                    "object": this.object.__member_expression,
                    "property": this.property,
                    "computed": false
                },
                "__first_object": this.object.__first_object
            };
        }
        if ((typeof this.parent !== "undefined" && this.parent !== null ? this.parent.type : void 0) === "NullPropagatingExpression") {
            return condition;
        }
        condition = {
            "type": "LogicalExpression",
            "operator": "&&",
            "left": {
                "type": "BinaryExpression",
                "operator": "!==",
                "left": {
                    "type": "UnaryExpression",
                    "operator": "typeof",
                    "argument": this.object.__first_object == null ? this.object : this.object.__first_object
                },
                "right": {
                    "type": "StringLiteral",
                    "value": "undefined",
                    "extra": { "raw": "\"undefined\"" }
                }
            },
            "right": condition
        };
        condition = {
            "type": "ConditionalExpression",
            "test": condition,
            "consequent": {
                "type": "MemberExpression",
                "object": !!(this.object.type === "Identifier") || !this.object.__member_expression ? this.object : this.object.__member_expression,
                "property": this.property,
                "computed": false
            },
            "alternate": {
                "type": "UnaryExpression",
                "operator": "void",
                "argument": {
                    "type": "NumericLiteral",
                    "value": 0,
                    "extra": { "raw": "0" }
                },
                "prefix": true
            },
            "__null_propagating": true
        };
        return condition;
    };
    NullPropagatingExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.NullPropagatingExpression = NullPropagatingExpression;
}());

//# sourceMappingURL=src/ast/expressions/NullPropagatingExpression.map