"use strict";
(function () {
    let Node = module.require("./Node").Node, CallExpression = module.require("./expressions/CallExpression").CallExpression;
    function Parameter(id, defaultValue, splat) {
        Node.call(this);
        this.type = "Parameter";
        this.splat = splat;
        this.id = id;
        this.id.parent = this;
        this.defaultValue = defaultValue;
        if (typeof this.defaultValue !== "undefined" && this.defaultValue !== null) {
            this.defaultValue.parent = this;
        }
    }
    Parameter.prototype = Object.create(Node);
    Parameter.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.id = this.id.codegen(false);
        if (typeof this.defaultValue !== "undefined" && this.defaultValue !== null) {
            this.defaultValue = this.defaultValue.codegen();
        }
        return this;
    };
    Parameter.prototype.hasCallExpression = function () {
        return false;
    };
    Parameter.generateFunctionExtend = function (func, nextVar = "functionExpression0") {
        if (!(typeof func.inheritsFrom !== "undefined" && func.inheritsFrom !== null)) {
            return;
        }
        if (func.inheritsFrom.type === "UndefinedLiteral") {
            Node.getErrorManager().error({
                type: "UndefinedExtend",
                message: "cannot extend undefined as a prototype",
                loc: func.loc
            });
        } else {
            if (!!(func.inheritsFrom.type !== "CallExpression") && !!(func.inheritsFrom.type !== "NullLiteral")) {
                func.inheritsFrom = new CallExpression(func.inheritsFrom, []);
                func.inheritsFrom.parent = func;
            }
        }
        if (func.inheritsFrom.type !== "NullLiteral") {
            func.body.body.splice(0, 0, {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": func.inheritsFrom.callee,
                        "property": {
                            "type": "Identifier",
                            "name": "call"
                        }
                    },
                    "arguments": [{ "type": "ThisExpression" }].concat(func.inheritsFrom.arguments)
                }
            });
        }
        if (func.type === "FunctionDeclarationStatement") {
            this.inheritsFrom = this.inheritsFrom.codegen();
        }
        let context = func.getContext(), id = func.id;
        if (func.type === "FunctionExpression") {
            id = {
                "type": "Identifier",
                "name": nextVar
            };
            context.node.body.splice(context.position, 0, {
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": func
                    }],
                "kind": "let",
                "codeGenerated": true
            });
        }
        context.node.body.splice(context.position + 1, 0, {
            "type": "ExpressionStatement",
            "codeGenerated": "true",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": id,
                    "property": {
                        "type": "Identifier",
                        "name": "prototype"
                    }
                },
                "right": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "Object"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "create"
                        }
                    },
                    "arguments": [func.inheritsFrom.callee]
                }
            }
        });
        return id;
    };
    Parameter.generateFunctionBody = function (func, params, body, defaults) {
        let splatPosition = -1;
        let i = 0;
        for (let param of params) {
            if (param.splat) {
                if (splatPosition !== -1) {
                    Node.getErrorManager().error({
                        type: "MultipleSplatsDisallowed",
                        message: "multiple splats are disallowed in a function declaration",
                        loc: param.loc
                    });
                }
                splatPosition = i;
            }
            param = param.codegen();
            defaults.push(param.defaultValue);
            if (typeof param.defaultValue !== "undefined" && param.defaultValue !== null) {
                params[i] = {
                    type: "AssignmentPattern",
                    left: param.id,
                    right: param.defaultValue
                };
            } else {
                params[i] = param.id;
            }
            func.defineIdentifier(param.id);
            i++;
        }
        if (splatPosition !== -1) {
            let declarations = [{
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "__splat"
                    },
                    "init": null
                }];
            let i = 0;
            for (let param of params) {
                let init;
                if (i < splatPosition) {
                    init = {
                        "type": "MemberExpression",
                        "computed": true,
                        "object": {
                            "type": "Identifier",
                            "name": "arguments"
                        },
                        "property": {
                            "type": "NumericLiteral",
                            "value": i
                        }
                    };
                } else {
                    if (i === splatPosition) {
                        init = {
                            "type": "ConditionalExpression",
                            "test": {
                                "type": "BinaryExpression",
                                "operator": "<=",
                                "left": {
                                    "type": "NumericLiteral",
                                    "value": params.length
                                },
                                "right": {
                                    "type": "MemberExpression",
                                    "computed": false,
                                    "object": {
                                        "type": "Identifier",
                                        "name": "arguments"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "length"
                                    }
                                }
                            },
                            "consequent": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "MemberExpression",
                                    "computed": false,
                                    "object": {
                                        "type": "MemberExpression",
                                        "computed": false,
                                        "object": {
                                            "type": "ArrayExpression",
                                            "elements": []
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "slice"
                                        }
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "call"
                                    }
                                },
                                "arguments": [
                                    {
                                        "type": "Identifier",
                                        "name": "arguments"
                                    },
                                    {
                                        "type": "NumericLiteral",
                                        "value": splatPosition
                                    }
                                ]
                            },
                            "alternate": {
                                "type": "ArrayExpression",
                                "elements": []
                            }
                        };
                        if (splatPosition < params.length - 1) {
                            init.consequent.arguments.push({
                                "type": "AssignmentExpression",
                                "operator": "=",
                                "left": {
                                    "type": "Identifier",
                                    "name": "__splat"
                                },
                                "right": {
                                    "type": "BinaryExpression",
                                    "operator": "-",
                                    "left": {
                                        "type": "MemberExpression",
                                        "computed": false,
                                        "object": {
                                            "type": "Identifier",
                                            "name": "arguments"
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "length"
                                        }
                                    },
                                    "right": {
                                        "type": "NumericLiteral",
                                        "value": params.length - splatPosition - 1
                                    }
                                }
                            });
                            init.alternate = {
                                "type": "SequenceExpression",
                                "expressions": [
                                    {
                                        "type": "AssignmentExpression",
                                        "operator": "=",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "__splat"
                                        },
                                        "right": {
                                            "type": "NumericLiteral",
                                            "value": splatPosition
                                        }
                                    },
                                    {
                                        "type": "ArrayExpression",
                                        "elements": []
                                    }
                                ]
                            };
                        }
                    } else {
                        init = {
                            "type": "MemberExpression",
                            "computed": true,
                            "object": {
                                "type": "Identifier",
                                "name": "arguments"
                            },
                            "property": {
                                "type": "UpdateExpression",
                                "operator": "++",
                                "argument": {
                                    "type": "Identifier",
                                    "name": "__splat"
                                },
                                "prefix": false
                            }
                        };
                    }
                }
                declarations.push({
                    "type": "VariableDeclarator",
                    "id": param,
                    "init": init
                });
                i++;
            }
            body.body = [{
                    "type": "VariableDeclaration",
                    "codeGenerated": true,
                    "declarations": declarations,
                    "kind": "let"
                }].concat(body.body);
            params.length = 0;
        }
    };
    exports.Parameter = Parameter;
}());

//# sourceMappingURL=src/ast/Parameter.map