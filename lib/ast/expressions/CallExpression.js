"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function CallExpression(callee, args) {
        Node.call(this);
        this.type = "CallExpression";
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
    CallExpression.prototype = Object.create(Node);
    CallExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let calleeType = this.callee.type;
        if (!this.callee.codeGenerated) {
            this.callee = this.callee.codegen();
        }
        let args = this.arguments;
        let splatPositions = [];
        let i = 0;
        for (let arg of args) {
            if (!!(args[i].type === "SplatExpression") || !!args[i].__splat) {
                splatPositions.push(i);
            }
            if (!args[i].codeGenerated) {
                args[i] = arg.codegen();
            }
            i++;
        }
        if (splatPositions.length > 0) {
            let argsClone = args.slice(0);
            args.length = 0;
            args.push({ "type": "NullLiteral" });
            if (argsClone.length === 1) {
                args.push(argsClone[0].arguments[0]);
            } else {
                args.push({
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": splatPositions[0] === 0 ? argsClone[0] : {
                            "type": "ArrayExpression",
                            "elements": argsClone.slice(0, splatPositions[0])
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "concat"
                        }
                    },
                    "arguments": argsClone.slice(splatPositions[0] === 0 ? 1 : splatPositions[0]).map(function (arg, i) {
                        if (splatPositions.indexOf(i + (splatPositions[0] === 0 ? 1 : splatPositions[0])) !== -1) {
                            return arg;
                        }
                        return {
                            "type": "ArrayExpression",
                            "elements": [arg]
                        };
                    })
                });
            }
        }
        if (!!(this.callee.type === "ConditionalExpression") && !!(!!(calleeType === "NullPropagatingExpression") || !!(calleeType === "MemberExpression"))) {
            let parent = this.parent;
            let consequent = {
                type: "CallExpression",
                callee: this.callee.consequent,
                arguments: this.arguments
            };
            if (splatPositions.length > 0) {
                this.callee.consequent = {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": this.callee.consequent,
                    "property": {
                        "type": "Identifier",
                        "name": "apply"
                    }
                };
            }
            if (parent.type === "ExpressionStatement") {
                parent.type = "IfStatement";
                parent.test = this.callee.test;
                parent.consequent = {
                    type: "BlockStatement",
                    body: [{
                            type: "ExpressionStatement",
                            expression: consequent
                        }]
                };
                parent.alternate = null;
            } else {
                this.type = "ConditionalExpression";
                this.test = this.callee.test;
                this.consequent = consequent;
                this.alternate = this.callee.alternate;
            }
        } else {
            if (splatPositions.length > 0) {
                this.callee = {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": this.callee,
                    "property": {
                        "type": "Identifier",
                        "name": "apply"
                    }
                };
            }
        }
        return this;
    };
    CallExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.CallExpression = CallExpression;
}());

//# sourceMappingURL=src/ast/expressions/CallExpression.map