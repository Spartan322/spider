"use strict";
(function () {
    let Node = module.require("./Node").Node;
    function Program(body) {
        Node.call(this);
        this.type = "Program";
        this.body = body;
        let i = 0;
        for (let statement of body) {
            if (typeof statement !== "undefined" && statement !== null) {
                statement.parent = this;
            } else {
                body[i] = { type: "EmptyStatement" };
            }
            i++;
        }
        this.definedIdentifiers = Program.prototype.generateIdentifiers("Infinity", "NaN", "eval", "uneval", "isFinite", "isNaN", "parseFloat", "parseInt", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "escape", "unescape", "Object", "Function", "Boolean", "Symbol", "Error", "EvalError", "InternalError", "RangeError", "ReferenceError", "StopIteration", "SyntaxError", "TypeError", "URIError", "Number", "Math", "Date", "String", "RegExp", "Array", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "Map", "Set", "WeakMap", "WeakSet", "ArrayBuffer", "DataView", "JSON", "Iterator", "Generator", "Promise", "arguments");
    }
    Program.prototype = Object.create(Node);
    Program.prototype.codegen = function () {
        if (!Node.prototype.codegen.call(this)) {
            return;
        }
        let i = 0;
        while (i < this.body.length) {
            let statement = this.body[i];
            if (!statement || !!statement.codeGenerated) {
                i++;
                continue;
            }
            if (!!statement.codegen && !!statement.codegen()) {
                this.body[this.body.indexOf(statement)] = statement;
                i++;
            } else {
                this.body.splice(i, 1);
            }
        }
        return this;
    };
    Program.prototype.generateIdentifiers = function () {
        let __splat, identifiers = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
        return identifiers.map(function (id) {
            return {
                "type": "Identifier",
                "name": id
            };
        });
    };
    exports.Program = Program;
}());

//# sourceMappingURL=src/ast/Program.map