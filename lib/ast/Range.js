"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function Range(start, operator, to) {
        Node.call(this);
        this.type = "Range";
        this.operator = operator;
        this.start = start;
        if (typeof this.start !== "undefined" && this.start !== null) {
            this.start.parent = this;
        }
        this.to = to;
        if (typeof this.to !== "undefined" && this.to !== null) {
            this.to.parent = this;
        }
    }
    Range.prototype = Object.create(Node);
    Range.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let isNumber = function (n) {
            return !isNaN(parseFloat(n)) && !!isFinite(n);
        };
        let isNumeric = !!isNumber(this.start.value) && !!isNumber(this.to.value);
        this.start = this.start.codegen();
        this.to = this.to.codegen();
        let updateOperator, testOperator;
        if (isNumeric) {
            updateOperator = this.start.value < this.to.value ? "++" : "--";
            testOperator = this.start.value < this.to.value ? "<" : ">";
            if (this.operator === "..") {
                testOperator += "=";
            }
        }
        if (!!isNumeric && !!(Math.abs(this.to.value - this.start.value) <= 20)) {
            this.type = "ArrayExpression";
            this.elements = [];
            let test = function (i) {
                if (testOperator === ">") {
                    return i > this.to.value;
                } else if (testOperator === "<") {
                    return i < this.to.value;
                } else if (testOperator === ">=") {
                    return i >= this.to.value;
                } else if (testOperator === "<=") {
                    return i <= this.to.value;
                }
            };
            for (let i = this.start.value; test.call(this, i); updateOperator === "++" ? i++ : i--) {
                this.elements.push({
                    "type": "NumericLiteral",
                    "value": i
                });
            }
        } else {
            let testExpression, updateExpression;
            let declarations = [{
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "_results"
                    },
                    "init": {
                        "type": "ArrayExpression",
                        "elements": []
                    }
                }];
            if (isNumeric) {
                testExpression = {
                    "type": "BinaryExpression",
                    "operator": testOperator,
                    "left": {
                        "type": "Identifier",
                        "name": "_i"
                    },
                    "right": this.to
                };
                updateExpression = {
                    "type": "UpdateExpression",
                    "operator": updateOperator,
                    "argument": {
                        "type": "Identifier",
                        "name": "_i"
                    },
                    "prefix": false
                };
            } else {
                if (this.start.hasCallExpression()) {
                    let startId = {
                        "type": "Identifier",
                        "name": "_start"
                    };
                    declarations.push({
                        "type": "VariableDeclarator",
                        "id": startId,
                        "init": this.start
                    });
                    this.start = startId;
                }
                if (this.to.hasCallExpression()) {
                    let endId = {
                        "type": "Identifier",
                        "name": "_end"
                    };
                    declarations.push({
                        "type": "VariableDeclarator",
                        "id": endId,
                        "init": this.to
                    });
                    this.to = endId;
                }
                testExpression = {
                    "type": "ConditionalExpression",
                    "test": {
                        "type": "BinaryExpression",
                        "operator": "<=",
                        "left": this.start,
                        "right": this.to
                    },
                    "consequent": {
                        "type": "BinaryExpression",
                        "operator": "<" + (this.operator === ".." ? "=" : ""),
                        "left": {
                            "type": "Identifier",
                            "name": "_i"
                        },
                        "right": this.to
                    },
                    "alternate": {
                        "type": "BinaryExpression",
                        "operator": ">" + (this.operator === ".." ? "=" : ""),
                        "left": {
                            "type": "Identifier",
                            "name": "_i"
                        },
                        "right": this.to
                    }
                };
                updateExpression = {
                    "type": "ConditionalExpression",
                    "test": {
                        "type": "BinaryExpression",
                        "operator": "<=",
                        "left": this.start,
                        "right": this.to
                    },
                    "consequent": {
                        "type": "UpdateExpression",
                        "operator": "++",
                        "argument": {
                            "type": "Identifier",
                            "name": "_i"
                        },
                        "prefix": false
                    },
                    "alternate": {
                        "type": "UpdateExpression",
                        "operator": "--",
                        "argument": {
                            "type": "Identifier",
                            "name": "_i"
                        },
                        "prefix": false
                    }
                };
            }
            this.type = "CallExpression";
            this.callee = {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "FunctionExpression",
                    "id": null,
                    "params": [],
                    "defaults": [],
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "VariableDeclaration",
                                "declarations": declarations,
                                "kind": "let"
                            },
                            {
                                "type": "ForStatement",
                                "init": {
                                    "type": "VariableDeclaration",
                                    "declarations": [{
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "type": "Identifier",
                                                "name": "_i"
                                            },
                                            "init": this.start
                                        }],
                                    "kind": "let"
                                },
                                "test": testExpression,
                                "update": updateExpression,
                                "body": {
                                    "type": "BlockStatement",
                                    "body": [{
                                            "type": "ExpressionStatement",
                                            "expression": {
                                                "type": "CallExpression",
                                                "callee": {
                                                    "type": "MemberExpression",
                                                    "computed": false,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "_results"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "push"
                                                    }
                                                },
                                                "arguments": [{
                                                        "type": "Identifier",
                                                        "name": "_i"
                                                    }]
                                            }
                                        }]
                                }
                            },
                            {
                                "type": "ReturnStatement",
                                "argument": {
                                    "type": "Identifier",
                                    "name": "_results"
                                }
                            }
                        ]
                    },
                    "rest": null,
                    "generator": false,
                    "expression": false
                },
                "property": {
                    "type": "Identifier",
                    "name": "apply"
                }
            };
            Object.defineProperty(this, "arguments", {
                value: [{ "type": "ThisExpression" }],
                enumerable: true
            });
        }
        return this;
    };
    Range.prototype.hasCallExpression = function () {
        return true;
    };
    exports.Range = Range;
}());

//# sourceMappingURL=src/ast/Range.map