"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function Class(id, extend, body, isExpression) {
        Node.call(this);
        this.type = isExpression ? "ClassExpression" : "ClassDeclaration";
        this.id = id;
        this.id.parent = this;
        this.superClass = extend;
        if (typeof this.superClass !== "undefined" && this.superClass !== null) {
            this.superClass.parent = this;
        }
        this.body = body;
        this.body.parent = this;
    }
    Class.prototype = Object.create(Node);
    Class.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.id = this.id.codegen();
        if (typeof this.superClass !== "undefined" && this.superClass !== null) {
            this.superClass = this.superClass.codegen();
        }
        this.body = this.body.codegen();
        return this;
    };
    exports.Class = Class;
}());

//# sourceMappingURL=src/ast/class/Class.map