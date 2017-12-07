"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ClassBody(body) {
        Node.call(this);
        this.body = body;
        let i = 0;
        for (let statement of this.body) {
            if (statement) {
                statement.parent = this;
            } else {
                this.body[i] = { type: "EmptyStatement" };
            }
            i++;
        }
        this.type = "ClassBody";
    }
    ClassBody.prototype = Object.create(Node);
    ClassBody.prototype.codegen = function () {
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
    exports.ClassBody = ClassBody;
}());

//# sourceMappingURL=src/ast/class/ClassBody.map