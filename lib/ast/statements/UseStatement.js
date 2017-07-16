"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function UseStatement(identifiers) {
        Node.call(this);
        this.type = "UseStatement";
        this.identifiers = identifiers;
        for (let id of this.identifiers) {
            id.parent = this;
        }
    }
    UseStatement.prototype = Object.create(Node);
    UseStatement.predefinedCollections = {
        "browser": [
            "document",
            "window",
            "screen",
            "location",
            "navigator",
            "alert",
            "console",
            "setTimeout"
        ],
        "node": [
            "require",
            "exports",
            "module",
            "global",
            "console",
            "process",
            "setTimeout",
            "__dirname",
            "__filename"
        ]
    };
    UseStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let context = this.getContext().node;
        for (let id of this.identifiers) {
            if (id.predefinedCollection) {
                for (let p of exports.UseStatement.predefinedCollections[id.name]) {
                    context.defineIdentifier({ name: p });
                }
            } else {
                context.defineIdentifier(id);
            }
        }
        return null;
    };
    exports.UseStatement = UseStatement;
}());

//# sourceMappingURL=src/ast/statements/UseStatement.map