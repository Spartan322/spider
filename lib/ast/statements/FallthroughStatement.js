"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function FallthroughStatement() {
        Node.call(this);
        this.type = "FallthroughStatement";
    }
    FallthroughStatement.prototype = Object.create(Node);
    FallthroughStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let parent = this.parent;
        let iterations = 0;
        while (!!(typeof parent !== "undefined" && parent !== null) && !parent.switchCase) {
            parent = parent.parent;
            iterations++;
        }
        if (typeof parent !== "undefined" && parent !== null) {
            parent.fallthrough = true;
        } else {
            Node.getErrorManager().error({
                type: "InvalidFallthroughContext",
                message: "fallthrough statement is only allowed in a switch case clause.",
                loc: this.loc
            });
        }
        let switchStatement = parent.parent;
        if (!switchStatement.fallthroughId) {
            switchStatement.fallthroughId = {
                "type": "Identifier",
                "name": this.getNextVariableName("fallthrough")
            };
        }
        switchStatement.branchFallthrough = true;
        parent.body.body = [{
                "type": "ExpressionStatement",
                "codeGenerated": true,
                "expression": {
                    "type": "AssignmentExpression",
                    "operator": "=",
                    "left": switchStatement.fallthroughId,
                    "right": {
                        "type": "NumericLiteral",
                        "value": 2
                    }
                }
            }].concat(parent.body.body);
        this.type = "ExpressionStatement";
        this.expression = {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": switchStatement.fallthroughId,
            "right": {
                "type": "NumericLiteral",
                "value": 1
            }
        };
        return this;
    };
    exports.FallthroughStatement = FallthroughStatement;
}());

//# sourceMappingURL=src/ast/statements/FallthroughStatement.map