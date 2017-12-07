"use strict";
(function () {
    let Node = module.require("../Node").Node, Parameter = module.require("../Parameter").Parameter;
    function ClassMethod(id, params, body, isStatic) {
        Node.call(this);
        this.type = "ClassMethod";
        this.defaults = [];
        this.rest = null;
        this.generator = false;
        this.expression = false;
        this.kind = "method";
        this.key = id;
        this.key.parent = this;
        this.body = body;
        this.body.parent = this;
        this.params = params;
        for (let param of params) {
            param.parent = this;
        }
        this["static"] = !!isStatic;
    }
    ClassMethod.prototype = Object.create(Node);
    ClassMethod.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.key.codegen();
        Parameter.generateFunctionBody(this, this.params, this.body, this.defaults);
        this.body = this.body.codegen();
        return this;
    };
    ClassMethod.prototype.hasCallExpression = function () {
        return true;
    };
    exports.ClassMethod = ClassMethod;
}());

//# sourceMappingURL=src/ast/class/ClassMethod.map