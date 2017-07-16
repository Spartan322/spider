"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function SwitchStatement(discriminant, cases) {
        Node.call(this);
        this.type = "SwitchStatement";
        this.discriminant = discriminant;
        this.discriminant.parent = this;
        this.cases = cases;
        for (let caseClause of this.cases) {
            caseClause.parent = this;
        }
    }
    SwitchStatement.prototype = Object.create(Node);
    SwitchStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let context = this.getContext();
        let firstCase, currentCase, defaultCase;
        let fallthroughPosition = 1;
        this.discriminant = this.discriminant.codegen();
        if (this.discriminant.hasCallExpression()) {
            let id = {
                "type": "Identifier",
                "name": SwitchStatement.getNextVariableName()
            };
            context.node.body.splice(context.position, 0, {
                "type": "VariableDeclaration",
                "codeGenerated": true,
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": this.discriminant
                    }],
                "kind": "let"
            });
            this.discriminant = id;
        }
        let hasFallthrough = false;
        for (let caseClause of this.cases) {
            if (!caseClause.tests) {
                defaultCase = caseClause;
                break;
            }
            if (!(typeof firstCase !== "undefined" && firstCase !== null)) {
                firstCase = caseClause.codegen();
                currentCase = firstCase;
            } else {
                if (currentCase.fallthrough) {
                    hasFallthrough = true;
                    currentCase = caseClause.codegen(this.branchFallthrough);
                    context.node.body.splice(context.position + fallthroughPosition++, 0, currentCase);
                } else {
                    currentCase.alternate = caseClause.codegen(typeof this.fallthroughId !== "undefined" && this.fallthroughId !== null);
                    currentCase = currentCase.alternate;
                }
            }
        }
        if (hasFallthrough) {
            for (let caseClause of this.cases) {
                if (!caseClause.fallthrough && !!(caseClause !== defaultCase)) {
                    caseClause.body.body = [{
                            "type": "ExpressionStatement",
                            "codeGenerated": true,
                            "expression": {
                                "type": "AssignmentExpression",
                                "operator": "=",
                                "left": this.fallthroughId,
                                "right": {
                                    "type": "NumericLiteral",
                                    "value": 2
                                }
                            }
                        }].concat(caseClause.body.body);
                }
            }
        }
        if (typeof defaultCase !== "undefined" && defaultCase !== null) {
            if (!(typeof firstCase !== "undefined" && firstCase !== null)) {
                Node.getErrorManager().error({
                    type: "SingleDefaultClause",
                    message: "default clause without other case clauses is disallowed.",
                    loc: defaultCase.loc
                });
            } else {
                if (currentCase.fallthrough) {
                    defaultCase = defaultCase.codegen(typeof this.fallthroughId !== "undefined" && this.fallthroughId !== null);
                    defaultCase.codeGenerated = true;
                    if (typeof this.fallthroughId !== "undefined" && this.fallthroughId !== null) {
                        context.node.body.splice(context.position + fallthroughPosition++, 0, defaultCase);
                    } else {
                        for (let statement of defaultCase.body) {
                            context.node.body.splice(context.position + fallthroughPosition++, 0, statement);
                        }
                    }
                } else {
                    currentCase.alternate = defaultCase.codegen(typeof this.fallthroughId !== "undefined" && this.fallthroughId !== null);
                }
            }
        }
        if (typeof this.fallthroughId !== "undefined" && this.fallthroughId !== null) {
            context.node.body.splice(context.position, 0, {
                "type": "VariableDeclaration",
                "codeGenerated": true,
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": this.fallthroughId,
                        "init": {
                            "type": "NumericLiteral",
                            "value": 0
                        }
                    }],
                "kind": "let"
            });
        }
        if (!(typeof firstCase !== "undefined" && firstCase !== null)) {
            this.type = "ExpressionStatement";
            this.expression = this.discriminant;
        } else {
            this.type = firstCase.type;
            this.test = firstCase.test;
            this.consequent = firstCase.consequent;
            this.alternate = firstCase.alternate;
        }
        return this;
    };
    SwitchStatement.getNextVariableName = function () {
        if (!(typeof this.switchStatementIndex !== "undefined" && this.switchStatementIndex !== null)) {
            this.switchStatementIndex = 0;
        }
        return "switchStatement" + this.switchStatementIndex++;
    };
    SwitchStatement.resetVariableNames = function () {
        this.switchStatementIndex = 0;
    };
    exports.SwitchStatement = SwitchStatement;
}());

//# sourceMappingURL=src/ast/statements/SwitchStatement.map