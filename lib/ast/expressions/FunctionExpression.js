"use strict";
(function () {
    let Node = module.require("../Node").Node, Parameter = module.require("../Parameter").Parameter, CallExpression = module.require("../expressions/CallExpression").CallExpression;
    function FunctionExpression(id, params, body, inheritsFrom, operator) {
        Node.call(this);
        if (operator === "=>") {
            this.type = "ArrowFunctionExpression";
        } else {
            this.type = "FunctionExpression";
        }
        this.defaults = [];
        this.rest = null;
        this.generator = false;
        this.expression = false;
        this.operator = operator;
        this.id = id;
        if (typeof this.id !== "undefined" && this.id !== null) {
            this.id.parent = this;
        }
        this.body = body;
        this.params = params;
        body.parent = this;
        for (let param of params) {
            param.parent = this;
        }
        this.inheritsFrom = inheritsFrom;
        if (typeof this.inheritsFrom !== "undefined" && this.inheritsFrom !== null) {
            this.inheritsFrom.parent = this;
        }
        if (this.body.type !== "BlockStatement") {
            this.autoBlock = true;
            this.body = {
                "type": "BlockStatement",
                "body": [{
                        "type": "ReturnStatement",
                        "argument": this.body
                    }]
            };
            let self = this;
            this.getContext = function () {
                return {
                    node: self.body,
                    position: -1
                };
            };
        }
    }
    FunctionExpression.prototype = Object.create(Node);
    FunctionExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (typeof this.id !== "undefined" && this.id !== null) {
            this.id = this.id.codegen(false);
        }
        Parameter.generateFunctionBody(this, this.params, this.body, this.defaults);
        if (this.autoBlock) {
            this.body.body[0].argument = this.body.body[this.body.body.length - 1].argument.codegen();
        } else {
            this.body = this.body.codegen();
        }
        if (typeof this.inheritsFrom !== "undefined" && this.inheritsFrom !== null) {
            return Parameter.generateFunctionExtend(this, this.getNextVariableName("functionExpression"));
        }
        return this;
    };
    FunctionExpression.prototype.hasCallExpression = function () {
        return true;
    };
    exports.FunctionExpression = FunctionExpression;
}());

//# sourceMappingURL=src/ast/expressions/FunctionExpression.map