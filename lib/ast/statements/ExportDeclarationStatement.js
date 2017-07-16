"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ExportDeclarationStatement(specifiers, source, declaration, isDefault) {
        Node.call(this);
        this.type = "ExportNamedDeclaration";
        if (isDefault) {
            this.type = "ExportDefaultDeclaration";
        } else {
            if (!!(typeof specifiers !== "undefined" && specifiers !== null) && !!((typeof specifiers[0] !== "undefined" && specifiers[0] !== null ? specifiers[0].type : void 0) === "ExportBatchSpecifier")) {
                this.type = "ExportAllDeclaration";
            }
        }
        this["default"] = isDefault;
        this.specifiers = specifiers;
        if (typeof this.specifiers !== "undefined" && this.specifiers !== null) {
            for (let specifier of this.specifiers) {
                specifier.parent = this;
            }
        }
        this.source = source;
        if (typeof this.source !== "undefined" && this.source !== null) {
            this.source.parent = this;
        }
        this.declaration = declaration;
        if (typeof this.declaration !== "undefined" && this.declaration !== null) {
            this.declaration.parent = this;
        }
    }
    ExportDeclarationStatement.prototype = Object.create(Node);
    ExportDeclarationStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (typeof this.specifiers !== "undefined" && this.specifiers !== null) {
            let i = 0;
            for (let specifier of this.specifiers) {
                this.specifiers[i] = specifier.codegen();
                i++;
            }
        }
        this.source = typeof this.source !== "undefined" && this.source !== null ? this.source.codegen() : void 0;
        this.declaration = typeof this.declaration !== "undefined" && this.declaration !== null ? this.declaration.codegen() : void 0;
        return this;
    };
    exports.ExportDeclarationStatement = ExportDeclarationStatement;
}());

//# sourceMappingURL=src/ast/statements/ExportDeclarationStatement.map