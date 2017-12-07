"use strict";
(function () {
    let Node = module.require("../Node").Node;
    function ClassProperty(id, init, isStatic) {
        Node.call(this);
        this.type = "ClassProperty";
        this.key = id;
        this.key.parent = this;
        this.value = init;
        this.value.parent = this;
        this["static"] = !!isStatic;
    }
    ClassProperty.prototype = Object.create(Node);
    ClassProperty.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (typeof this.value !== "undefined" && this.value !== null) {
            this.value = this.value.codegen();
        }
        this.key = this.key.codegen();
        return this;
    };
    exports.ClassProperty = ClassProperty;
}());

//# sourceMappingURL=src/ast/class/ClassProperty.map