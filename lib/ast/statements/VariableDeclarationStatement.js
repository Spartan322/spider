"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function VariableDeclarationStatement(declarations) {
        Node.call(this);
        this.type = "VariableDeclaration";
        this.declarations = declarations;
        this.kind = "let";
        for (let decl of declarations) {
            decl.parent = this;
        }
    }
    VariableDeclarationStatement.prototype = Object.create(Node);
    VariableDeclarationStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        for (let statement of this.declarations) {
            statement = statement.codegen();
            if (typeof statement !== "undefined" && statement !== null) {
                this.declarations[this.declarations.indexOf(statement)] = statement;
            }
            i++;
        }
        return this;
    };
    exports.VariableDeclarationStatement = VariableDeclarationStatement;
}());

//# sourceMappingURL=src/ast/statements/VariableDeclarationStatement.map