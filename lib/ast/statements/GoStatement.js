"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function GoStatement(body) {
        Node.call(this);
        this.type = "GoStatement";
        this.body = body;
        this.body.parent = this;
    }
    GoStatement.prototype = Object.create(Node);
    GoStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.body = this.body.codegen();
        this.type = "ExpressionStatement";
        this.expression = {
            "type": "CallExpression",
            "callee": {
                "type": "FunctionExpression",
                "id": null,
                "params": [],
                "defaults": [],
                "body": this.body,
                "rest": null,
                "generator": false,
                "expression": false,
                "async": true,
                "extra": { "parenthesized": true }
            },
            "arguments": []
        };
        return this;
    };
    exports.GoStatement = GoStatement;
}());

//# sourceMappingURL=src/ast/statements/GoStatement.map