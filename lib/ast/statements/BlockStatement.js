"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function BlockStatement(body) {
        Node.call(this);
        this.type = "BlockStatement";
        this.body = body;
        let i = 0;
        for (let statement of body) {
            if (statement) {
                statement.parent = this;
            } else {
                body[i] = { type: "EmptyStatement" };
            }
            i++;
        }
    }
    BlockStatement.prototype = Object.create(Node);
    BlockStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        while (i < this.body.length) {
            let statement = this.body[i];
            if (!statement || !!statement.codeGenerated) {
                i++;
                continue;
            }
            if (typeof statement.codegen === "function" ? statement.codegen() : void 0) {
                this.body[this.body.indexOf(statement)] = statement;
                i++;
            } else {
                this.body.splice(i, 1);
            }
        }
        return this;
    };
    exports.BlockStatement = BlockStatement;
}());

//# sourceMappingURL=src/ast/statements/BlockStatement.map