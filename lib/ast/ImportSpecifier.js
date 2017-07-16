"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function ImportSpecifier(id, alias) {
        Node.call(this);
        this.type = "ImportSpecifier";
        if (typeof id !== "undefined" && id !== null) {
            this.id = id;
            this.id.parent = this;
        }
        if (typeof alias !== "undefined" && alias !== null) {
            this.alias = alias;
            this.alias.parent = this;
        }
    }
    ImportSpecifier.prototype = Object.create(Node);
    ImportSpecifier.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (typeof this.id !== "undefined" && this.id !== null) {
            this.id = this.id.codegen(false);
            this.imported = this.id;
            this.local = this.alias == null ? this.id : this.alias;
        } else {
            this.type = "ImportNamespaceSpecifier";
        }
        Object.defineProperty(this, "name", {
            value: typeof this.alias !== "undefined" && this.alias !== null ? {
                "type": "Identifier",
                "name": this.alias.name
            } : null,
            enumerable: true
        });
        this.getContext().node.defineIdentifier(this.alias == null ? this.id : this.alias);
        return this;
    };
    exports.ImportSpecifier = ImportSpecifier;
}());

//# sourceMappingURL=src/ast/ImportSpecifier.map