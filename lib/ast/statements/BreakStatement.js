"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function BreakStatement() {
        Node.call(this);
        this.type = "BreakStatement";
    }
    BreakStatement.prototype = Object.create(Node);
    BreakStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        return this;
    };
    exports.BreakStatement = BreakStatement;
}());

//# sourceMappingURL=src/ast/statements/BreakStatement.map