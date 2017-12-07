"use strict";
(function () {
    let Node = module.require("../Node").Node, Parameter = module.require("../Parameter").Parameter, CallExpression = module.require("../expressions/CallExpression").CallExpression;
    function FunctionDeclarationStatement(id, params, body, inheritsFrom) {
        Node.call(this);
        this.type = "FunctionDeclaration";
        this.defaults = [];
        this.rest = null;
        this.generator = false;
        this.expression = false;
        this.id = id;
        this.id.parent = this;
        this.body = body;
        this.body.parent = this;
        this.params = params;
        for (let param of params) {
            param.parent = this;
        }
        this.inheritsFrom = inheritsFrom;
        if (typeof this.inheritsFrom !== "undefined" && this.inheritsFrom !== null) {
            this.inheritsFrom.parent = this;
        }
    }
    FunctionDeclarationStatement.prototype = Object.create(Node);
    FunctionDeclarationStatement.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        this.id = this.id.codegen();
        Parameter.generateFunctionBody(this, this.params, this.body, this.defaults);
        this.body = this.body.codegen();
        if (typeof this.inheritsFrom !== "undefined" && this.inheritsFrom !== null) {
            Parameter.generateFunctionExtend(this);
        }
        return this;
    };
    FunctionDeclarationStatement.prototype.hasCallExpression = function () {
        return true;
    };
    exports.FunctionDeclarationStatement = FunctionDeclarationStatement;
}());

//# sourceMappingURL=src/ast/statements/FunctionDeclarationStatement.map