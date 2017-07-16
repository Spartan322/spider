"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ImportDeclarationStatement(specifiers, source, kind) {
        Node.call(this);
        this.type = "ImportDeclaration";
        this.kind = kind;
        this.specifiers = specifiers;
        for (let specifier of this.specifiers) {
            specifier.parent = this;
        }
        this.source = source;
        this.source.parent = this;
    }
    ImportDeclarationStatement.prototype = Object.create(Node);
    ImportDeclarationStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        for (let specifier of this.specifiers) {
            this.specifiers[i] = specifier.codegen();
            i++;
        }
        this.source = this.source.codegen();
        return this;
    };
    exports.ImportDeclarationStatement = ImportDeclarationStatement;
}());

//# sourceMappingURL=src/ast/statements/ImportDeclarationStatement.map