"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function ImportDefaultSpecifier(id) {
        Node.call(this);
        this.type = "ImportDefaultSpecifier";
        this.id = id;
        this.id.parent = this;
    }
    ImportDefaultSpecifier.prototype = Object.create(Node);
    ImportDefaultSpecifier.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.id = this.id.codegen(false);
        this.local = this.id;
        this.getContext().node.defineIdentifier(this.id);
        return this;
    };
    exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
}());

//# sourceMappingURL=src/ast/ImportDefaultSpecifier.map