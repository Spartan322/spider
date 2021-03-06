"use strict";
(function () {
    module.exports = function (grunt) {
        require("time-grunt")(grunt);
        require("load-grunt-tasks")(grunt);
        grunt.initConfig({
            nodeunit: { files: ["test/**/*_test.js"] },
            eslint: {
                lib: [
                    "lib/**/*.js",
                    "!lib/parser.js"
                ],
                test: ["test/**/*.js"]
            },
            mochacli: {
                options: {
                    reporter: "spec",
                    bail: true,
                    timeout: 15000
                },
                all: ["test/*.js"]
            },
            watch: {
                gruntfile: {
                    files: "<%= jshint.gruntfile.src %>",
                    tasks: ["jshint:gruntfile"]
                },
                lib: {
                    files: "<%= jshint.lib.src %>",
                    tasks: [
                        "jshint:lib",
                        "mochacli"
                    ]
                },
                test: {
                    files: "<%= jshint.test.src %>",
                    tasks: [
                        "jshint:test",
                        "mochacli"
                    ]
                }
            },
            peg: {
                spider: {
                    src: "src/spider.pegjs",
                    dest: "lib/parser.js"
                }
            },
            mocha_istanbul: {
                coverage: {
                    src: "test",
                    options: {
                        mask: "*.js",
                        excludes: ["lib/parser.js"]
                    }
                }
            },
            clean: { build: ["lib/"] },
            spider_script: {
                options: { target: "ES6" },
                build: {
                    files: [
                        { "Gruntfile.js": "Gruntfile.spider" },
                        {
                            expand: true,
                            cwd: "src",
                            src: ["**/*.spider"],
                            dest: "lib/",
                            ext: ".js"
                        }
                    ]
                }
            },
            copy: {
                build: {
                    files: [{
                            expand: true,
                            cwd: "src",
                            src: ["**/*.js"],
                            dest: "lib/"
                        }]
                }
            }
        });
        grunt.registerTask("default", [
            "build",
            "mochacli"
        ]);
        grunt.registerTask("build", [
            "clean:build",
            "peg",
            "spider_script:build",
            "copy:build"
        ]);
        grunt.registerTask("coverage", ["mocha_istanbul:coverage"]);
    };
}());

//# sourceMappingURL=Gruntfile.map