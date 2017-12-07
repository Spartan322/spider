"use strict";
(function () {
    function Node() {
        let self = this;
        self.codeGenerated = false;
        self.definedIdentifiers = [];
        Object.defineProperty(self, "parent", {
            value: null,
            writable: true,
            configurable: true,
            enumerable: false
        });
        self.getContext = function () {
            if (!!(self.type === "Program") || !!(self.type === "BlockStatement")) {
                return {
                    node: self,
                    position: -1
                };
            }
            if (!(typeof self.parent !== "undefined" && self.parent !== null)) {
                return null;
            }
            let context = self.parent.getContext();
            if (!(typeof context !== "undefined" && context !== null)) {
                return null;
            }
            if (context.position === -1) {
                return {
                    node: context.node,
                    position: context.node.body.indexOf(self)
                };
            } else {
                return context;
            }
        };
        self.defineIdentifier = function (identifier) {
            self.definedIdentifiers.push(identifier);
        };
        self.isIdentifierDefined = function (name) {
            let defined = false;
            for (let identifier of self.definedIdentifiers) {
                if (identifier.name === name) {
                    defined = true;
                }
            }
            return !!defined || !!(!!self.parent && !!self.parent.isIdentifierDefined(name));
        };
        self.getDefinedIdentifier = function (name) {
            let id;
            for (let identifier of self.definedIdentifiers) {
                if (identifier.name === name) {
                    id = identifier;
                }
            }
            return typeof id === "undefined" || id == null ? self.parent ? self.parent.getDefinedIdentifier(name) : null : id;
        };
        self.blockWrap = function () {
            if (self.type === "BlockStatement") {
                return self;
            }
            let myParent = self.parent;
            let blockStatement = module.require("./statements/BlockStatement");
            let block = new blockStatement.BlockStatement([self]);
            block.parent = myParent;
            return block;
        };
        self.getNextVariableName = (baseIdent, testIdent = true) => {
            if (!(typeof Node[baseIdent + "Index"] !== "undefined" && Node[baseIdent + "Index"] !== null)) {
                Node[baseIdent + "Index"] = 0;
            }
            let num = Node[baseIdent + "Index"];
            let result = baseIdent + num++;
            if (testIdent) {
                while (self.isIdentifierDefined(result)) {
                    result = baseIdent + num++;
                }
            }
            Node[baseIdent + "Index"] = num;
            return result;
        };
        self.getVariableName = (baseIdent) => {
            return Node[baseIdent + "Index"];
        };
    }
    Node.prototype.codegen = function () {
        if (this.codeGenerated) {
            return false;
        }
        this.codeGenerated = true;
        return true;
    };
    Node.setErrorManager = function (errorManager) {
        this.errorManager = errorManager;
    };
    Node.getErrorManager = function () {
        return this.errorManager;
    };
    exports.Node = Node;
}());

//# sourceMappingURL=src/ast/Node.map