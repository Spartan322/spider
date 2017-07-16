"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function ImportNamespaceSpecifier(id) {
        Node.call(this);
        this.type = "ImportNamespaceSpecifier";
        this.id = id;
        this.id.parent = this;
    }
    ImportNamespaceSpecifier.prototype = Object.create(Node);
    ImportNamespaceSpecifier.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.id = this.id.codegen(false);
        this.local = this.id;
        this.getContext().node.defineIdentifier(this.id);
        return this;
    };
    exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
}());

//# sourceMappingURL=src/ast/ImportNamespaceSpecifier.map