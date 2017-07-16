"use strict";
(function () {
    let Node = module.require("../Node").Node;
    let extend = require("util")._extend;
    function SuperExpression() {
        Node.call(this);
        this.type = "SuperExpression";
    }
    SuperExpression.prototype = Object.create(Node);
    SuperExpression.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        if (this.parent.type === "NullPropagatingExpression") {
            Node.getErrorManager().error({
                type: "InvalidSuperReference",
                message: "cannot refer to super before the ?. operator",
                loc: this.loc
            });
            return { type: "ThisExpression" };
        }
        if (this.parent.type !== "MemberExpression") {
            Node.getErrorManager().error({
                type: "InvalidUsageForSuper",
                message: "invalid usage of super keyword",
                loc: this.loc
            });
            return { type: "ThisExpression" };
        }
        let parentNode = this;
        let node = this;
        while (!!(!!node && !node.inheritsFrom) && !!(!!(node.type !== "AssignmentExpression") || !!(!!(!node.left.property || !!(node.left.property.name !== "prototype")) && !!(!node.left.object.property || !!(node.left.object.property.name !== "prototype"))))) {
            parentNode = node;
            node = node.parent;
        }
        if (!node) {
            Node.getErrorManager().error({
                type: "InvalidContextForSuper",
                message: "invalid context for super keyword",
                loc: this.loc
            });
            return { type: "ThisExpression" };
        }
        let addSelf = function (context) {
            let selfId = {
                "type": "Identifier",
                "name": "_self",
                "codeGenerated": "true"
            };
            if (!context.node.__isSelfDefined) {
                context.node.body.splice(0, 0, {
                    "type": "VariableDeclaration",
                    "declarations": [{
                            "type": "VariableDeclarator",
                            "id": selfId,
                            "init": { type: "ThisExpression" }
                        }],
                    "kind": "let"
                });
                context.node.__isSelfDefined = true;
            }
            return selfId;
        };
        let mutateCallExpression = function (id, parent, selfNode) {
            selfNode.codeGenerated = true;
            parent.object = id;
            parent.property = Object.create({
                "codeGenerated": "true",
                "type": "Identifier",
                "name": "call"
            });
            parent.parent.arguments.splice(0, 0, selfNode);
        };
        if (node.type === "AssignmentExpression") {
            let identifier = node.left.object;
            let context;
            if (node.left.property.name !== "prototype") {
                identifier = identifier.object;
                context = { node: node.right.body };
            } else {
                if (node.right.type !== "ObjectExpression") {
                    Node.getErrorManager().error({
                        type: "InvalidUsageForSuper",
                        message: "invalid usage of super keyword",
                        loc: this.loc
                    });
                    return { type: "ThisExpression" };
                }
                let contextNode = this;
                while (!!(typeof contextNode.parent !== "undefined" && contextNode.parent !== null) && !!(contextNode.parent !== node.right)) {
                    contextNode = contextNode.parent;
                }
                if (!!((typeof contextNode !== "undefined" && contextNode !== null ? contextNode.type : void 0) !== "ObjectProperty") || !!((typeof contextNode !== "undefined" && (contextNode !== null && contextNode.value !== null) ? contextNode.value.type : void 0) !== "FunctionExpression")) {
                    Node.getErrorManager().error({
                        type: "InvalidUsageForSuper",
                        message: "invalid usage of super keyword",
                        loc: this.loc
                    });
                    return { type: "ThisExpression" };
                }
                context = { node: contextNode.value.body };
            }
            let selfNode;
            if (context.node === this.getContext().node) {
                selfNode = { type: "ThisExpression" };
            } else {
                selfNode = addSelf(context);
            }
            if (this.parent.parent.type === "CallExpression") {
                let memberExpression = {
                    type: "MemberExpression",
                    computed: false,
                    object: {
                        type: "MemberExpression",
                        computed: false,
                        object: this.parent.getDefinedIdentifier(identifier.name).parent.inheritsFrom.callee,
                        property: {
                            type: "Identifier",
                            name: "prototype"
                        }
                    },
                    property: this.parent.parent.callee.property
                };
                mutateCallExpression(memberExpression, this.parent, selfNode);
                return memberExpression;
            }
            return selfNode;
        }
        let superContext = parentNode.getContext();
        let lastObject = this.parent;
        while (lastObject.object.type === "MemberExpression") {
            lastObject = lastObject.object;
        }
        lastObject.object = { type: "ThisExpression" };
        let id = {
            "type": "Identifier",
            "name": "_" + this.parent.property.name
        };
        if (!this.parent.isIdentifierDefined(id.name)) {
            superContext.node.body.splice(superContext.position, 0, {
                "codeGenerated": "true",
                "type": "VariableDeclaration",
                "declarations": [{
                        "type": "VariableDeclarator",
                        "id": id,
                        "init": extend({}, lastObject)
                    }],
                "kind": "let"
            });
            superContext.node.defineIdentifier(id);
        }
        if (this.parent.parent.type === "CallExpression") {
            mutateCallExpression(id, this.parent, addSelf(superContext));
        } else {
            this.parent.type = "Identifier";
            Object.defineProperty(this.parent, "name", {
                value: id.name,
                enumerable: true
            });
        }
        return id;
    };
    SuperExpression.prototype.hasCallExpression = function () {
        return false;
    };
    exports.SuperExpression = SuperExpression;
}());

//# sourceMappingURL=src/ast/expressions/SuperExpression.map