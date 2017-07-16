"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ContinueStatement() {
        Node.call(this);
        this.type = "ContinueStatement";
    }
    ContinueStatement.prototype = Object.create(Node);
    ContinueStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    exports.ContinueStatement = ContinueStatement;
}());

//# sourceMappingURL=src/ast/statements/ContinueStatement.map