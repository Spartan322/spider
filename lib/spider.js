"use strict";
(function () {
    let parser = module.require("./parser"), ast = module.require("./ast"), babel = require("babel-core"), generate = require("babel-generator").default, chalk = require("chalk"), transfer = require("multi-stage-sourcemap").transfer;
    exports.compile = function (options) {
        let result = {
            errors: [],
            result: null,
            sourceMap: null
        };
        options.fileName = options.fileName == null ? "tmp" : options.fileName;
        let outFileNameWithoutExtension = options.fileName.substring(0, options.fileName.lastIndexOf("."));
        let outFileName = outFileNameWithoutExtension + ".js";
        let mapFileName = outFileNameWithoutExtension + ".map";
        resetVariableNames();
        ast.Node.setErrorManager(new ErrorManager(result.errors));
        let parsed;
        try {
            parsed = parser.parse(options.text);
        } catch (e) {
            result.errors.push(getParsingError(e));
        }
        if (!parsed) {
            return result;
        }
        let generatorOpts = {
            sourceMaps: options.generateSourceMap,
            sourceMapTarget: options.generateSourceMap ? options.fileName : null,
            filename: options.generateSourceMap ? options.fileName : null,
            quotes: "double",
            useStrict: options.useStrict == null ? true : options.useStrict,
            iifi: options.iifi == null ? true : options.iifi
        };
        let tree = parsed.codegen();
        if (options.target !== "ES5") {
            tree = wrapCode(tree, generatorOpts.useStrict, generatorOpts.iifi);
        }
        if (options.target === "ES5") {
            console.log(result.sourceMap);
            let babelResult = babel.transformFromAst(tree, options.text, {
                filename: generatorOpts.filename,
                sourceMaps: generatorOpts.sourceMaps,
                sourceMapTarget: generatorOpts.sourceMapTarget,
                generatorOpts
            });
            result.result = babelResult.code;
            if (options.generateSourceMap) {
                result.sourceMap = babelResult.map;
            }
        } else {
            if (options.target === "ES6") {
                let output = generate(tree, generatorOpts, options.text);
                if (options.generateSourceMap) {
                    result.result = output.code + "\n\n//# sourceMappingURL=" + mapFileName;
                    result.sourceMap = output.map;
                } else {
                    result.result = output.code;
                }
            }
        }
        if (options.verbose) {
            console.log(JSON.stringify(parsed, null, 4));
            console.log(result.result);
        }
        return result;
    };
    exports.formatErrors = function (fileName, content, errors) {
        let output = [];
        let maxCol = 0;
        let maxLine = 0;
        output.push(chalk.white(fileName), "\n");
        let lines = content.split("\n");
        let tabCharacter = "__SPIDER_TAB";
        let errorIndex = 0;
        for (let error of errors) {
            let line = error.loc.start.line;
            let column = error.loc.start.column + 1;
            let lineCharCount = line.toString().length;
            let columnCharCount = column.toString().length;
            maxCol = Math.max(maxCol, columnCharCount);
            maxLine = Math.max(maxCol, lineCharCount);
            output.push(tabCharacter);
            output.push(chalk.gray("line", line));
            output.push(tabCharacter, lineCharCount);
            output.push(chalk.gray("col", column));
            output.push(tabCharacter, columnCharCount);
            output.push(chalk.red(error.message), "\n");
            if (typeof error.loc !== "undefined" && error.loc !== null ? error.loc.start : void 0) {
                let start = error.loc.start;
                let end = error.loc.end;
                if (0 < start.line <= lines.length) {
                    output.push(tabCharacter, tabCharacter, tabCharacter);
                    output.push(chalk.green(lines[start.line - 1].replace(/(\r\n|\n|\r)/gm, ""), "\n", tabCharacter, tabCharacter));
                    output.push(chalk.red(generateErrorColumnString(start.column, end ? end.column - 1 : 0)));
                }
            }
            output.push("\n");
            errorIndex++;
        }
        let str = output.join("");
        let tabLength = Math.max(maxLine, maxCol);
        for (let i = 1; i <= tabLength; i++) {
            let regex = new RegExp(tabCharacter + i, "g");
            str = str.replace(regex, generateSpace(Math.max(2 + tabLength - i, 2)));
        }
        return str.replace(new RegExp(tabCharacter, "g"), generateSpace(2));
    };
    function ErrorManager(errors) {
        this.errors = errors;
    }
    ErrorManager.prototype.error = function (e) {
        this.errors.push(e);
    };
    function getParsingError(e) {
        let message;
        if (e.expected) {
            if (e.found) {
                message = "unexpected " + e.found;
            } else {
                message = "unexpected end of input";
            }
        } else {
            message = e.message;
        }
        return {
            type: "SyntaxError",
            message: message,
            loc: {
                start: {
                    line: e.line,
                    column: e.column - 1
                }
            }
        };
    }
    function resetVariableNames() {
        for (let prop of Object.keys(ast.Node)) {
            let val = ast.Node[prop];
            if (!!prop.endsWith("Index") && !!((typeof val === "undefined" ? "undefined" : {}.toString.call(val).match(/\s([a-zA-Z]+)/)[1].toLowerCase()) === "number")) {
                ast.Node[prop] = 0;
            }
        }
    }
    function wrapCode(tree, useStrict = false, iifi = false) {
        if (!!iifi || !!useStrict) {
            let body = [];
            if (iifi) {
                body.push({
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "defaults": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": tree.body
                            },
                            "rest": null,
                            "generator": false,
                            "expression": false
                        },
                        "arguments": []
                    }
                });
            } else {
                body = body.concat(tree.body);
            }
            tree = {
                "type": "Program",
                "body": body,
                "directives": useStrict ? [{
                        "type": "Directive",
                        "value": {
                            "type": "DirectiveLiteral",
                            "value": "use strict",
                            "extra": {
                                "raw": "\"use strict\"",
                                "rawValue": "use strict"
                            }
                        }
                    }] : null
            };
        }
        return tree;
    }
    function generateSpace(len) {
        let chars = [];
        for (let i = 0; i < len; i++) {
            chars.push(" ");
        }
        return chars.join("");
    }
    function generateErrorColumnString(errorStartIndex, errorEndIndex) {
        let chars = [];
        let i = 0;
        if (!errorEndIndex) {
            errorEndIndex = errorStartIndex;
        }
        for (; i < errorStartIndex; i++) {
            chars.push(" ");
        }
        for (i = errorStartIndex; i <= errorEndIndex; i++) {
            chars.push("^");
        }
        return chars.join("");
    }
}());

//# sourceMappingURL=src/spider.map