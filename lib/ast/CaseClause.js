"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function CaseClause(tests, body) {
        Node.call(this);
        this.type = "CaseClause";
        this.body = body;
        this.body.parent = this;
        this.tests = tests;
        if (typeof this.tests !== "undefined" && this.tests !== null) {
            for (let test of this.tests) {
                test.parent = this;
            }
        }
    }
    CaseClause.prototype = Object.create(Node);
    CaseClause.prototype.codegen = function (branchFallthrough) {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (!(typeof this.tests !== "undefined" && this.tests !== null) && !branchFallthrough) {
            return this.body.codegen();
        }
        this.type = "IfStatement";
        this.switchCase = true;
        let rangeError = false;
        if (typeof this.tests !== "undefined" && this.tests !== null) {
            for (let test of this.tests) {
                let equalsToDiscriminant;
                if (test.type === "Range") {
                    let fromCheck;
                    if (test.start) {
                        fromCheck = {
                            "type": "BinaryExpression",
                            "operator": ">=",
                            "left": this.parent.discriminant,
                            "right": test.start
                        };
                    }
                    let toCheck;
                    if (test.to) {
                        toCheck = {
                            "type": "BinaryExpression",
                            "operator": "<" + (test.operator === ".." ? "=" : ""),
                            "left": this.parent.discriminant,
                            "right": test.to
                        };
                    }
                    if (!!fromCheck && !!toCheck) {
                        equalsToDiscriminant = {
                            "type": "LogicalExpression",
                            "operator": "&&",
                            "left": fromCheck,
                            "right": toCheck
                        };
                    } else {
                        if (!!fromCheck || !!toCheck) {
                            equalsToDiscriminant = typeof fromCheck === "undefined" || fromCheck == null ? toCheck : fromCheck;
                        } else {
                            rangeError = test;
                            break;
                        }
                    }
                } else {
                    if (test.type === "ArrayExpression") {
                        test = test.codegen();
                        equalsToDiscriminant = {
                            "type": "BinaryExpression",
                            "operator": ">=",
                            "left": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": this.parent.discriminant,
                                "property": {
                                    "type": "Identifier",
                                    "name": "length"
                                }
                            },
                            "right": {
                                "type": "NumericLiteral",
                                "value": test.elements.length
                            }
                        };
                        let i = 0;
                        for (let element of test.elements) {
                            if (typeof element !== "undefined" && element !== null) {
                                equalsToDiscriminant = {
                                    "type": "LogicalExpression",
                                    "operator": "&&",
                                    "left": equalsToDiscriminant,
                                    "right": {
                                        "type": "BinaryExpression",
                                        "operator": "===",
                                        "left": {
                                            "type": "MemberExpression",
                                            "computed": true,
                                            "object": this.parent.discriminant,
                                            "property": {
                                                "type": "NumericLiteral",
                                                "value": i
                                            }
                                        },
                                        "right": element
                                    }
                                };
                            }
                            i++;
                        }
                    } else {
                        equalsToDiscriminant = {
                            "type": "BinaryExpression",
                            "operator": "===",
                            "left": this.parent.discriminant,
                            "right": test.codegen()
                        };
                    }
                }
                if (!this.test) {
                    this.test = equalsToDiscriminant;
                } else {
                    this.test = {
                        "type": "LogicalExpression",
                        "operator": "||",
                        "left": this.test,
                        "right": equalsToDiscriminant
                    };
                }
            }
        }
        if (rangeError) {
            Node.getErrorManager().error({
                type: "EmptyRange",
                message: "empty range in case clause is disallowed.",
                loc: rangeError.loc
            });
            return null;
        }
        this.consequent = this.body.codegen();
        if (branchFallthrough) {
            let fallthroughTest = {
                "type": "BinaryExpression",
                "left": this.parent.fallthroughId,
                "operator": "<",
                "right": {
                    "type": "NumericLiteral",
                    "value": 2
                }
            };
            if (!(typeof this.tests !== "undefined" && this.tests !== null)) {
                this.test = fallthroughTest;
            } else {
                this.test = {
                    "type": "LogicalExpression",
                    "operator": "&&",
                    "left": fallthroughTest,
                    "right": this.test
                };
            }
        }
        this.alternate = null;
        return this;
    };
    exports.CaseClause = CaseClause;
}());

//# sourceMappingURL=src/ast/CaseClause.map