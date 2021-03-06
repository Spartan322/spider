/*global describe,it*/
'use strict';

var should = require('should'),
    spider = require('../lib/spider');

function generateTest(code, expectation) {
  return function () {
    should(spider.compile({ text: code,
      generateSourceMap: false,
      target: "ES6",
      iifi: false,
      useStrict: false
    }).result).be.exactly(expectation);
  };
}

function generateErrorTest(code, expectedErrors) {
  return function () {
    var errors = spider.compile({
      text: code,
      generateSourceMap: false,
      target: "ES6",
      iifi: false,
      useStrict: false
    }).errors;

    should(errors.map(function (error) {
      delete error.message;
      delete error.loc;

      return error;
    })).eql(expectedErrors);
  };
}

describe('variable statement:', function () {
  it('syntax error', generateErrorTest('var x = y^', [{ type: "SyntaxError" }]));

  it('create variable',
    generateTest('var a;', 'let a;'));

  it('create variable with number literal',
    generateTest('var a = 5;', 'let a = 5;'));

  it('create variable with hexidecimal number literal',
    generateTest('var a = 0xF;', 'let a = 15;'));

  it('create variable with octal number literal',
    generateTest('var a = 0o17;', 'let a = 15;'));

  it('create variable with binary number literal',
    generateTest('var a = 0b101;', 'let a = 5;'));

  it('create variable with string literal',
    generateTest('var a = "test";', 'let a = "test";'));

  it('create variable with boolean literal',
    generateTest('var a = true;', 'let a = true;'));

  it('create variable with null literal',
    generateTest('var a = null;', 'let a = null;'));

  it('create variable with identifier value',
    generateTest('var a = b;', 'let a = b;'));

  it('create multiple variables in one statement',
    generateTest('var a, b;', 'let a, b;'));

  it('create multiple variables in one statement with values',
    generateTest('var a = 5, b = false;', 'let a = 5,\n    b = false;'));

  it('create multiple variables in multiple statements',
    generateTest('var a; var b;', 'let a;\nlet b;'));
});

describe('member expressions:', function () {
  it('member expression with 2 nodes',
    generateTest('var a = b.c;', 'let a = b.c;'));

  it('member expression with 3 nodes',
    generateTest('var a = b.c.d;', 'let a = b.c.d;'));

  it('member expression with 4 nodes',
    generateTest('var a = b.c.d.e;', 'let a = b.c.d.e;'));
});

describe('null propagating member expressions:', function () {
  it('null propagating member expression with 2 nodes',
    generateTest('var a = b?.c;', 'let a = typeof b !== "undefined" && b !== null ? b.c : void 0;'));

  it('null propagating member expression with 3 nodes',
    generateTest('var a = b?.c?.d;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null ? b.c.d : void 0;'));

  it('null propagating member expression with 4 nodes',
    generateTest('var a = b?.c?.d?.e;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null && b.c.d !== null ? b.c.d.e : void 0;'));
});

describe('member and null propagating member expressions:', function () {
  it('1 member expression and 1 null propagating member expression',
    generateTest('var a = b.c?.d;', 'let a = typeof b.c !== "undefined" && b.c !== null ? b.c.d : void 0;'));

  it('2 member expressions and 1 null propagating member expression',
    generateTest('var a = b.c.d?.e;', 'let a = typeof b.c.d !== "undefined" && b.c.d !== null ? b.c.d.e : void 0;'));

  it('3 member expressions and 1 null propagating member expression',
    generateTest('var a = b.c.d.e?.f;', 'let a = typeof b.c.d.e !== "undefined" && b.c.d.e !== null ? b.c.d.e.f : void 0;'));

  it('1 member expression and 2 null propagating member expressions',
    generateTest('var a = b.c?.d?.e;', 'let a = typeof b.c !== "undefined" && b.c !== null && b.c.d !== null ? b.c.d.e : void 0;'));

  it('1 member expression and 3 null propagating member expressions',
    generateTest('var a = b.c?.d?.e?.f;', 'let a = typeof b.c !== "undefined" && b.c !== null && b.c.d !== null && b.c.d.e !== null ? b.c.d.e.f : void 0;'));

  it('2 member expressions and 2 null propagating member expressions',
    generateTest('var a = b.c.d?.e?.f;', 'let a = typeof b.c.d !== "undefined" && b.c.d !== null && b.c.d.e !== null ? b.c.d.e.f : void 0;'));

  it('3 member expressions and 3 null propagating member expressions',
    generateTest('var a = b.c.d.e?.f?.g?.h;', 'let a = typeof b.c.d.e !== \"undefined\" && b.c.d.e !== null && b.c.d.e.f !== null && b.c.d.e.f.g !== null ? b.c.d.e.f.g.h : void 0;'));

  it('1 null propagating member expression and 1 member expression',
    generateTest('var a = b?.c;', 'let a = typeof b !== \"undefined\" && b !== null ? b.c : void 0;'));

  it('2 null propagating member expressions and 1 member expression',
    generateTest('var a = b?.c?.d.e;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null ? b.c.d.e : void 0;'));

  it('3 null propagating member expressions and 1 member expression',
    generateTest('var a = b?.c?.d?.e.f;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null && b.c.d !== null ? b.c.d.e.f : void 0;'));

  it('1 null propagating member expression and 2 member expressions',
    generateTest('var a = b?.c.d;', 'let a = typeof b !== "undefined" && b !== null ? b.c.d : void 0;'));

  it('1 null propagating member expression and 3 member expressions',
    generateTest('var a = b?.c.d.e;', 'let a = typeof b !== "undefined" && b !== null ? b.c.d.e : void 0;'));

  it('2 null propagating member expressions and 2 member expressions',
    generateTest('var a = b?.c?.d.e.f;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null ? b.c.d.e.f : void 0;'));

  it('3 null propagating member expression and 2 member expressions',
    generateTest('var a = b?.c?.d?.e.f.g;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null && b.c.d !== null ? b.c.d.e.f.g : void 0;'));

  it('3 null propagating member expression and 3 member expressions',
    generateTest('var a = b?.c?.d?.e.f.g.h;', 'let a = typeof b !== "undefined" && b !== null && b.c !== null && b.c.d !== null ? b.c.d.e.f.g.h : void 0;'));

  it('1 member expression, 1 null propagating member expression, 1 member expression',
    generateTest('var a = b.c?.d.e;', 'let a = typeof b.c !== "undefined" && b.c !== null ? b.c.d.e : void 0;'));

  it('2 member expressions, 1 null propagating member expression, 1 member expression',
    generateTest('var a = b.c.d?.e.f;', 'let a = typeof b.c.d !== "undefined" && b.c.d !== null ? b.c.d.e.f : void 0;'));

  it('1 member expression, 2 null propagating member expressions, 1 member expression',
    generateTest('var a = b.c?.d?.e.f;', 'let a = typeof b.c !== \"undefined\" && b.c !== null && b.c.d !== null ? b.c.d.e.f : void 0;'));

  it('1 member expression, 1 null propagating member expression, 2 member expressions',
    generateTest('var a = b.c?.d.e.f;', 'let a = typeof b.c !== "undefined" && b.c !== null ? b.c.d.e.f : void 0;'));

  it('1 null propagating member expression, 1 member expression, 1 null propagating member expression',
    generateTest('var a = b?.c.d?.e;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.e : void 0;'));

  it('2 null propagating member expressions, 1 member expression, 1 null propagating member expression',
    generateTest('var a = b?.c?.d.e?.f;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null && b.c !== null ? b.c.d.e : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.f : void 0;'));

  it('3 null propagating member expressions, 1 member expression, 1 null propagating member expression',
    generateTest('var a = b?.c?.d?.e.f?.h;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null && b.c !== null && b.c.d !== null ? b.c.d.e.f : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.h : void 0;'));

  it('1 null propagating member expression, 2 member expressions, 1 null propagating member expression',
    generateTest('var a = b?.c.d.e?.f;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d.e : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.f : void 0;'));

  it('1 null propagating member expression, 3 member expressions, 1 null propagating member expression',
    generateTest('var a = b?.c.d.e.f?.h;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d.e.f : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.h : void 0;'));

  it('1 null propagating member expression, 1 member expression, 2 null propagating member expressions',
    generateTest('var a = b?.c.d?.e?.f;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.e !== null ? nullPropagating0.e.f : void 0;'));

  it('1 null propagating member expression, 1 member expression, 3 null propagating member expressions',
    generateTest('var a = b?.c.d?.e?.f?.h;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.e !== null && nullPropagating0.e.f !== null ? nullPropagating0.e.f.h : void 0;'));

  it('scramble member and null propagating member expressions (1)',
    generateTest('var a = b?.c.d?.e.f;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null ? b.c.d : void 0;\nlet a = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.e.f : void 0;'));

  it('scramble member and null propagating member expressions (2)',
    generateTest('var a = b?.c?.d.e?.f?.g.h?.i;', 'let nullPropagating0 = typeof b !== \"undefined\" && b !== null && b.c !== null ? b.c.d.e : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.f !== null ? nullPropagating0.f.g.h : void 0;\nlet a = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null ? nullPropagating1.i : void 0;'));
});

describe('call expressions and statements:', function () {
  it('call statement without arguments',
    generateTest('f();', 'f();'));

  it('call statement with 1 argument',
    generateTest('f(1);', 'f(1);'));

  it('call statement with 2 arguments',
    generateTest('f(1, true);',
      'f(1, true);'));

  it('call statement with 3 arguments',
    generateTest('f(1, true, "test");',
      'f(1, true, "test");'));

  it('call statement with 4 arguments',
    generateTest('f(1, true, "test", { a: 1 });',
      'f(1, true, "test", {\n  a: 1\n});'));

  it('call expression without arguments',
    generateTest('var a = f();', 'let a = f();'));

  it('call expression with 1 argument',
    generateTest('var a = f(1);', 'let a = f(1);'));

  it('call expression with 2 arguments',
    generateTest('var a = f(1, true);', 'let a = f(1, true);'));

  it('call expression with 3 arguments',
    generateTest('var a = f(1, true, "test");', 'let a = f(1, true, "test");'));

  it('call expression with 4 arguments',
    generateTest('var a = f(1, true, "test", { a: 1 });', 'let a = f(1, true, "test", {\n  a: 1\n});'));
});

describe('call statements with member expressions:', function () {
  it('1 member expression and 1 call statement',
    generateTest('a.f();', 'a.f();'));

  it('2 member expressions and 1 call statement',
    generateTest('a.b.f();', 'a.b.f();'));

  it('3 member expressions and 1 call statement',
    generateTest('a.b.c.f();', 'a.b.c.f();'));

  it('1 member expression and 2 call statements',
    generateTest('a.fn1().fn2();', 'a.fn1().fn2();'));

  it('1 member expression and 3 call statements',
    generateTest('a.fn1().fn2().fn3();', 'a.fn1().fn2().fn3();'));

  it('1 member expression, 1 call statement, 1 member expression, 1 call statement',
    generateTest('a.fn1().b.fn2();', 'a.fn1().b.fn2();'));

  it('2 member expression, 2 call statement, 2 member expression, 2 call statement',
    generateTest('a.b.fn1().fn2().c.d.fn3().fn4();', 'a.b.fn1().fn2().c.d.fn3().fn4();'));
});

describe('call statements with null propagating member expressions:', function () {
  it('1 null propagating member expression and 1 call statement',
    generateTest('a?.f();', 'if (typeof a !== "undefined" && a !== null) {\n  a.f();\n}'));

  it('2 null propagating member expressions and 1 call statement',
    generateTest('a?.b?.f();',
      'if (typeof a !== \"undefined\" && a !== null && a.b !== null) {\n  a.b.f();\n}'));

  it('3 null propagating member expressions and 1 call statement',
    generateTest('a?.b?.c?.f();',
      'if (typeof a !== \"undefined\" && a !== null && a.b !== null && a.b.c !== null) {\n  a.b.c.f();\n}'));

  it('1 null propagating member expression and 2 call statements',
    generateTest('a?.fn1()?.fn2();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.fn2();\n}'));

  it('1 null propagating member expression and 3 call statements',
    generateTest('a?.fn1()?.fn2()?.fn3();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.fn2() : void 0;\n\nif (typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null) {\n  nullPropagating1.fn3();\n}'));

  it('1 null propagating member expression, 1 call statement, 1 null propagating member expression, 1 call statement',
    generateTest('a?.fn1()?.b?.fn2();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.b !== null) {\n  nullPropagating0.b.fn2();\n}'));

  it('2 null propagating member expression, 2 call statement, 2 null propagating member expression, 2 call statement',
    generateTest('a?.b?.fn1()?.fn2()?.c?.d?.fn3()?.fn4();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null && a.b !== null ? a.b.fn1() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.fn2() : void 0;\nlet nullPropagating2 = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null && nullPropagating1.c !== null && nullPropagating1.c.d !== null ? nullPropagating1.c.d.fn3() : void 0;\n\nif (typeof nullPropagating2 !== \"undefined\" && nullPropagating2 !== null) {\n  nullPropagating2.fn4();\n}'));
});

describe('call statements with member and null propagating member expressions:', function () {
  it('1 member expression, 1 call statement, 1 null propagating member expression, 1 call statement',
    generateTest('a.b()?.c();', 'let nullPropagating0 = a.b();\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.c();\n}'));

  it('2 member expressions, 1 call statement, 1 null propagating member expression, 1 call statement',
    generateTest('a.b.c()?.d();', 'let nullPropagating0 = a.b.c();\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.d();\n}'));

  it('1 member expression, 2 call statements, 1 null propagating member expression, 1 call statement',
    generateTest('a.b().c()?.d();', 'let nullPropagating0 = a.b().c();\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.d();\n}'));

  it('1 member expression, 1 call statement, 2 null propagating member expressions, 1 call statement',
    generateTest('a.b()?.c?.d();', 'let nullPropagating0 = a.b();\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.c !== null) {\n  nullPropagating0.c.d();\n}'));

  it('1 member expression, 1 call statement, 1 null propagating member expression, 2 call statement',
    generateTest('a.b()?.c().d();', 'let nullPropagating0 = a.b();\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.c().d();\n}'));

  it('1 null propagating member expression, 1 call statement, 1 member expression, 1 call statement',
    generateTest('a?.b().c();',
      'if (typeof a !== \"undefined\" && a !== null) {\n  a.b().c();\n}'));

  it('2 null propagating member expression, 1 call statement, 1 member expression, 1 call statement',
    generateTest('a?.b()?.c().d();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.c().d();\n}'));

  it('1 null propagating member expression, 2 call statement, 1 member expression, 1 call statement',
    generateTest('a?.b()?.c.d();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null) {\n  nullPropagating0.c.d();\n}'));

  it('scramble call statements with member and null propagating member expressions',
    generateTest('a?.b()?.c.d().e.f.g?.h?.i?.j.k();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c.d().e.f.g : void 0;\n\nif (typeof nullPropagating1 !== "undefined" && nullPropagating1 !== null && nullPropagating1.h !== null && nullPropagating1.h.i !== null) {\n  nullPropagating1.h.i.j.k();\n}'));
});

describe('call expressions with member expressions:', function () {
  it('1 member expression and 1 call expression',
    generateTest('var x = a.f();', 'let x = a.f();'));

  it('2 member expressions and 1 call expression',
    generateTest('var x = a.b.f();', 'let x = a.b.f();'));

  it('3 member expressions and 1 call expression',
    generateTest('var x = a.b.c.f();', 'let x = a.b.c.f();'));

  it('1 member expression and 2 call expressions',
    generateTest('var x = a.fn1().fn2();', 'let x = a.fn1().fn2();'));

  it('1 member expression and 3 call expressions',
    generateTest('var x = a.fn1().fn2().fn3();', 'let x = a.fn1().fn2().fn3();'));

  it('1 member expression, 1 call expression, 1 member expression, 1 call expression',
    generateTest('var x = a.fn1().b.fn2();', 'let x = a.fn1().b.fn2();'));

  it('2 member expression, 2 call expression, 2 member expression, 2 call expression',
    generateTest('var x = a.b.fn1().fn2().c.d.fn3().fn4();', 'let x = a.b.fn1().fn2().c.d.fn3().fn4();'));
});

describe('call expressions with null propagating member expressions:', function () {
  it('1 null propagating member expression and 1 call expression',
    generateTest('var x = a?.f();', 'let x = typeof a !== \"undefined\" && a !== null ? a.f() : void 0;'));

  it('2 null propagating member expressions and 1 call expression',
    generateTest('var x = a?.b?.f();', 'let x = typeof a !== \"undefined\" && a !== null && a.b !== null ? a.b.f() : void 0;'));

  it('3 null propagating member expressions and 1 call expression',
    generateTest('var x = a?.b?.c?.f();', 'let x = typeof a !== \"undefined\" && a !== null && a.b !== null && a.b.c !== null ? a.b.c.f() : void 0;'));

  it('1 null propagating member expression and 2 call expressions',
    generateTest('var x = a?.fn1()?.fn2();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.fn2() : void 0;'));

  it('1 null propagating member expression and 3 call expressions',
    generateTest('var x = a?.fn1()?.fn2()?.fn3();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.fn2() : void 0;\nlet x = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null ? nullPropagating1.fn3() : void 0;'));

  it('1 null propagating member expression, 1 call expression, 1 null propagating member expression, 1 call expression',
    generateTest('var x = a?.fn1()?.b?.fn2();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.fn1() : void 0;\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.b !== null ? nullPropagating0.b.fn2() : void 0;'));

  it('2 null propagating member expression, 2 call expressions, 2 null propagating member expression, 2 call expressions',
    generateTest('var x = a?.b?.fn1()?.fn2()?.c?.d?.fn3()?.fn4();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null && a.b !== null ? a.b.fn1() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.fn2() : void 0;\nlet nullPropagating2 = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null && nullPropagating1.c !== null && nullPropagating1.c.d !== null ? nullPropagating1.c.d.fn3() : void 0;\nlet x = typeof nullPropagating2 !== \"undefined\" && nullPropagating2 !== null ? nullPropagating2.fn4() : void 0;'));
});

describe('call expressions with member and null propagating member expressions:', function () {
  it('1 member expression, 1 call expression, 1 null propagating member expression, 1 call expression',
    generateTest('var x = a.b()?.c();', 'let nullPropagating0 = a.b();\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c() : void 0;'));

  it('2 member expressions, 1 call expression, 1 null propagating member expression, 1 call expression',
    generateTest('var x = a.b.c()?.d();', 'let nullPropagating0 = a.b.c();\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.d() : void 0;'));

  it('1 member expression, 2 call expressions, 1 null propagating member expression, 1 call expression',
    generateTest('var x = a.b().c()?.d();', 'let nullPropagating0 = a.b().c();\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.d() : void 0;'));

  it('1 member expression, 1 call expression, 2 null propagating member expressions, 1 call expression',
    generateTest('var x = a.b()?.c?.d();', 'let nullPropagating0 = a.b();\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && nullPropagating0.c !== null ? nullPropagating0.c.d() : void 0;'));

  it('1 member expression, 1 call expression, 1 null propagating member expression, 2 call expressions',
    generateTest('var x = a.b()?.c().d();', 'let nullPropagating0 = a.b();\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c().d() : void 0;'));

  it('1 null propagating member expression, 1 call expression, 1 member expression, 1 call expression',
    generateTest('var x = a?.b().c();', 'let x = typeof a !== \"undefined\" && a !== null ? a.b().c() : void 0;'));

  it('2 null propagating member expression, 1 call expression, 1 member expression, 1 call expression',
    generateTest('var x = a?.b()?.c().d();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c().d() : void 0;'));

  it('1 null propagating member expression, 2 call expressions, 1 member expression, 1 call expression',
    generateTest('var x = a?.b()?.c.d();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c.d() : void 0;'));

  it('scramble call expressions with member and null propagating member expressions',
    generateTest('var x = a?.b()?.c.d().e.f.g?.h?.i?.j.k();', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c.d().e.f.g : void 0;\nlet x = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null && nullPropagating1.h !== null && nullPropagating1.h.i !== null ? nullPropagating1.h.i.j.k() : void 0;'));
});

describe('null coalescing expressions:', function () {
  it('null coalescing expression with 2 identifiers',
    generateTest('var x = a ?? b;', 'let x = typeof a === \"undefined\" || a == null ? b : a;'));

  it('null coalescing expression with 2 member expressions',
    generateTest('var x = a.b ?? c.d;', 'let x = a.b == null ? c.d : a.b;'));

  it('null coalescing expression with 6 member expressions',
    generateTest('var x = a.b.c.d ?? e.f.g.h;', 'let x = a.b.c.d == null ? e.f.g.h : a.b.c.d;'));

  it('null coalescing expression with 2 null propagating member expressions',
    generateTest('var x = a?.b ?? c?.d;', 'let nullCoalescing0 = typeof a !== \"undefined\" && a !== null ? a.b : void 0;\nlet x = nullCoalescing0 == null ? typeof c !== \"undefined\" && c !== null ? c.d : void 0 : nullCoalescing0;'));

  it('null coalescing expression with 6 null propagating member expressions',
    generateTest('var x = a?.b?.c?.d ?? e?.f?.g?.h;', 'let nullCoalescing0 = typeof a !== \"undefined\" && a !== null && a.b !== null && a.b.c !== null ? a.b.c.d : void 0;\nlet x = nullCoalescing0 == null ? typeof e !== \"undefined\" && e !== null && e.f !== null && e.f.g !== null ? e.f.g.h : void 0 : nullCoalescing0;'));

  it('null coalescing expression with 6 null propagating member expressions combined',
    generateTest('var x = a?.b.c?.d ?? e.f?.g?.h;', 'let nullPropagating0 = typeof a !== \"undefined\" && a !== null ? a.b.c : void 0;\nlet nullCoalescing0 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.d : void 0;\nlet x = nullCoalescing0 == null ? typeof e.f !== \"undefined\" && e.f !== null && e.f.g !== null ? e.f.g.h : void 0 : nullCoalescing0;'));

  it('null coalescing expression with 2 call expressions',
    generateTest('var x = a() ?? b();', 'let nullCoalescing0 = a();\nlet x = nullCoalescing0 == null ? b() : nullCoalescing0;'));

  it('null coalescing expression with 2 call expressions and null propagating member expressions',
    generateTest('var x = a.b()?.c() ?? d?.e().f();', 'let nullPropagating0 = a.b();\nlet nullCoalescing0 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null ? nullPropagating0.c() : void 0;\nlet x = nullCoalescing0 == null ? typeof d !== \"undefined\" && d !== null ? d.e().f() : void 0 : nullCoalescing0;'));

  it('null coalescing statement',
    generateTest('a() ?? b();', 'let nullCoalescing0 = a();\n\nif (nullCoalescing0 == null) {\n  b();\n}'));
});

describe('null check call expressions:', function () {
  it('null check call expression',
    generateTest('var x = a?();', 'let x = typeof a === \"function\" ? a() : void 0;'));

  it('null check call expression with 1 argument',
    generateTest('var a = f?(1);', 'let a = typeof f === \"function\" ? f(1) : void 0;'));

  it('null check call expression with 2 arguments',
    generateTest('var a = f?(1, true);', 'let a = typeof f === \"function\" ? f(1, true) : void 0;'));

  it('null check call expression with 3 arguments',
    generateTest('var a = f?(1, true, "test");', 'let a = typeof f === \"function\" ? f(1, true, \"test\") : void 0;'));

  it('null check call expression with 4 arguments',
    generateTest('var a = f?(1, true, "test", { a: 1 });', 'let a = typeof f === \"function\" ? f(1, true, \"test\", {\n  a: 1\n}) : void 0;'));

  it('call expression with null check call expression',
    generateTest('var x = a?()();', 'let x = (typeof a === \"function\" ? a() : void 0)();'));

  it('null check call expression with null check call expression',
    generateTest('var x = a?()?();', 'let nullCheck0 = typeof a === \"function\" ? a() : void 0;\nlet x = typeof nullCheck0 === \"function\" ? nullCheck0() : void 0;'));

  it('null check call expression with member expression',
    generateTest('var x = a?().b;', 'let x = typeof a === \"function\" ? a().b : void 0;'));

  it('null check call expression with 2 member expressions',
    generateTest('var x = a?().b.c;', 'let x = typeof a === \"function\" ? a().b.c : void 0;'));

  it('null check call expression with call expression',
    generateTest('var x = a?().b();', 'let x = typeof a === \"function\" ? a().b() : void 0;'));

  it('null check call expression with 2 call expressions',
    generateTest('var x = a?().b().c();', 'let x = typeof a === \"function\" ? a().b().c() : void 0;'));

  it('member expression with null check call expression',
    generateTest('var x = a.b?();', 'let x = typeof a.b === \"function\" ? a.b() : void 0;'));

  it('2 member expressions with null check call expression',
    generateTest('var x = a.b.c?();', 'let x = typeof a.b.c === \"function\" ? a.b.c() : void 0;'));

  it('call expression with null check call expression',
    generateTest('var x = a().b?();', 'let nullCheck0 = a().b;\nlet x = typeof nullCheck0 === \"function\" ? nullCheck0() : void 0;'));

  it('2 call expression with null check call expression',
    generateTest('var x = a().b().c?();', 'let nullCheck0 = a().b().c;\nlet x = typeof nullCheck0 === \"function\" ? nullCheck0() : void 0;'));

  it('2 null check call expressions',
    generateTest('var x = a?().b?();', 'let nullCheck0 = typeof a === \"function\" ? a().b : void 0;\nlet x = typeof nullCheck0 === \"function\" ? nullCheck0() : void 0;'));

  it('3 null check call expressions',
    generateTest('var x = a?().b?().c?();', 'let nullCheck0 = typeof a === \"function\" ? a().b : void 0;\nlet nullCheck1 = typeof nullCheck0 === \"function\" ? nullCheck0().c : void 0;\nlet x = typeof nullCheck1 === \"function\" ? nullCheck1() : void 0;'));

  it('2 null check call expressions with null propagating relationship',
    generateTest('var x = a?()?.b?();', 'let nullPropagating0 = typeof a === \"function\" ? a() : void 0;\nlet x = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && typeof nullPropagating0.b === \"function\" ? nullPropagating0.b() : void 0;'));

  it('3 null check call expressions with null propagating relationship',
    generateTest('var x = a?()?.b?()?.c();', 'let nullPropagating0 = typeof a === \"function\" ? a() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && typeof nullPropagating0.b === \"function\" ? nullPropagating0.b() : void 0;\nlet x = typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null ? nullPropagating1.c() : void 0;'));
});

describe('null check call statements:', function () {
  it('null check call statement',
    generateTest('a?();',
      'if (typeof a === \"function\") {\n  a();\n}'));

  it('null check call statement with 1 argument',
    generateTest('f?(1);',
      'if (typeof f === \"function\") {\n  f(1);\n}'));

  it('null check call statement with 2 arguments',
    generateTest('f?(1, true);',
      'if (typeof f === \"function\") {\n  f(1, true);\n}'));

  it('null check call statement with 3 arguments',
    generateTest('f?(1, true, "test");',
      'if (typeof f === \"function\") {\n  f(1, true, \"test\");\n}'));

  it('null check call statement with 4 arguments',
    generateTest('f?(1, true, "test", { a: 1 });',
      'if (typeof f === \"function\") {\n  f(1, true, \"test\", {\n    a: 1\n  });\n}'));

  it('call statement with null check call expression',
    generateTest('a?()();',
      '(typeof a === \"function\" ? a() : void 0)();'));

  it('null check call expression with null check call expression',
    generateTest('a?()?();', 'let nullCheck0 = typeof a === \"function\" ? a() : void 0;\n\nif (typeof nullCheck0 === \"function\") {\n  nullCheck0();\n}'));

  it('null check call expression with call statement',
    generateTest('a?().b();',
      'if (typeof a === \"function\") {\n  a().b();\n}'));

  it('null check call expression with 2 call statements',
    generateTest('a?().b().c();',
      'if (typeof a === \"function\") {\n  a().b().c();\n}'));

  it('member expression with null check call statement',
    generateTest('a.b?();',
      'if (typeof a.b === \"function\") {\n  a.b();\n}'));

  it('2 member expressions with null check call statement',
    generateTest('a.b.c?();',
      'if (typeof a.b.c === \"function\") {\n  a.b.c();\n}'));

  it('call expression with null check call statement',
    generateTest('a().b?();', 'let nullCheck0 = a().b;\n\nif (typeof nullCheck0 === \"function\") {\n  nullCheck0();\n}'));

  it('2 call expression with null check call statement',
    generateTest('a().b().c?();', 'let nullCheck0 = a().b().c;\n\nif (typeof nullCheck0 === \"function\") {\n  nullCheck0();\n}'));

  it('2 null check call statements',
    generateTest('a?().b?();', 'let nullCheck0 = typeof a === \"function\" ? a().b : void 0;\n\nif (typeof nullCheck0 === \"function\") {\n  nullCheck0();\n}'));

  it('3 null check call statements',
    generateTest('a?().b?().c?();', 'let nullCheck0 = typeof a === \"function\" ? a().b : void 0;\nlet nullCheck1 = typeof nullCheck0 === \"function\" ? nullCheck0().c : void 0;\n\nif (typeof nullCheck1 === \"function\") {\n  nullCheck1();\n}'));

  it('2 null check call statements with null propagating relationship',
    generateTest('a?()?.b?();', 'let nullPropagating0 = typeof a === \"function\" ? a() : void 0;\n\nif (typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && typeof nullPropagating0.b === \"function\") {\n  nullPropagating0.b();\n}'));

  it('3 null check call statements with null propagating relationship',
    generateTest('a?()?.b?()?.c();', 'let nullPropagating0 = typeof a === \"function\" ? a() : void 0;\nlet nullPropagating1 = typeof nullPropagating0 !== \"undefined\" && nullPropagating0 !== null && typeof nullPropagating0.b === \"function\" ? nullPropagating0.b() : void 0;\n\nif (typeof nullPropagating1 !== \"undefined\" && nullPropagating1 !== null) {\n  nullPropagating1.c();\n}'));
});

describe('existential expressions:', function () {
  it('existential opreator on identifier',
    generateTest('var x = a?;', 'let x = typeof a !== \"undefined\" && a !== null;'));

  it('existential opreator on call expression',
    generateTest('var x = a()?;', 'let existential0 = a();\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on null check call expression',
    generateTest('var x = a?()?;', 'let existential0 = typeof a === \"function\" ? a() : void 0;\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on member expression',
    generateTest('var x = a.b?;', 'let x = typeof a.b !== \"undefined\" && a.b !== null;'));

  it('existential opreator on member expression with call expression',
    generateTest('var x = a.b()?;', 'let existential0 = a.b();\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on member expression with null check call expression',
    generateTest('var x = a.b?()?;', 'let existential0 = typeof a.b === \"function\" ? a.b() : void 0;\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on null propagating member expression',
    generateTest('var x = a?.b?;', 'let existential0 = typeof a !== \"undefined\" && a !== null ? a.b : void 0;\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on propagating member expression with call expression',
    generateTest('var x = a?.b()?;', 'let existential0 = typeof a !== \"undefined\" && a !== null ? a.b() : void 0;\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));

  it('existential opreator on propagating member expression with null check call expression',
    generateTest('var x = a?.b?()?;', 'let existential0 = typeof a !== \"undefined\" && a !== null && typeof a.b === \"function\" ? a.b() : void 0;\nlet x = typeof existential0 !== \"undefined\" && existential0 !== null;'));
});

describe('object expressions:', function () {
  it('empty object',
    generateTest('var x = {};', 'let x = {};'));

  it('object with number property',
    generateTest('var x = {a: 1 };', 'let x = {\n  a: 1\n};'));

  it('object with boolean property',
    generateTest('var x = { a: true };', 'let x = {\n  a: true\n};'));

  it('object with identifier property',
    generateTest('var x = { a: b };', 'let x = {\n  a: b\n};'));

  it('object with string property',
    generateTest('var x = { a: "test" };', 'let x = {\n  a: "test"\n};'));

  it('object with object property',
    generateTest('var x = { a: { b: 1 } };', 'let x = {\n  a: {\n    b: 1\n  }\n};'));

  it('object with array property',
    generateTest('var x = { a: [true] };', 'let x = {\n  a: [true]\n};'));

  it('object with quoted object property name',
    generateTest('var x = { "a b": { b: 1 } };', 'let x = {\n  \"a b\": {\n    b: 1\n  }\n};'));

  it('object with 2 properties',
    generateTest('var x = { a: 1, b: true };', 'let x = {\n  a: 1,\n  b: true\n};'));

  it('object with 3 properties',
    generateTest('var x = { a: 1, b: true, c: b };', 'let x = {\n  a: 1,\n  b: true,\n  c: b\n};'));

  it('object with 4 properties',
    generateTest('var x = { a: 1, b: true, c: b, d: "test" };', 'let x = {\n  a: 1,\n  b: true,\n  c: b,\n  d: "test"\n};'));
});

describe('array expressions:', function () {
  it('empty array',
    generateTest('var x = [];', 'let x = [];'));

  it('array with 1 number element',
    generateTest('var x = [1];', 'let x = [1];'));

  it('array with 2 number elements',
    generateTest('var x = [1, 2];', 'let x = [1, 2];'));

  it('array with 3 number elements',
    generateTest('var x = [1, 2, 3];', 'let x = [1, 2, 3];'));

  it('array with 1 boolean element',
    generateTest('var x = [true];', 'let x = [true];'));

  it('array with 2 boolean elements',
    generateTest('var x = [true, false];', 'let x = [true, false];'));

  it('array with 3 boolean elements',
    generateTest('var x = [true, false, true];', 'let x = [true, false, true];'));

  it('array with 1 identifier element',
    generateTest('var x = [a];', 'let x = [a];'));

  it('array with 2 identifier elements',
    generateTest('var x = [a, b];', 'let x = [a, b];'));

  it('array with 3 identifier elements',
    generateTest('var x = [a, b, c];', 'let x = [a, b, c];'));

  it('array with 1 string element',
    generateTest('var x = ["test"];', 'let x = ["test"];'));

  it('array with 2 string elements',
    generateTest('var x = ["test", "test2"];', 'let x = ["test", "test2"];'));

  it('array with 3 string elements',
    generateTest('var x = ["test", "test2", "test3"];', 'let x = ["test", "test2", "test3"];'));

  it('array with 1 array element',
    generateTest('var x = [[true]];', 'let x = [[true]];'));

  it('array with 2 array elements',
    generateTest('var x = [[true], [false]];', 'let x = [[true], [false]];'));

  it('array with 3 array elements',
    generateTest('var x = [[true], [false], [true]];', 'let x = [[true], [false], [true]];'));

  it('array with 1 object element',
    generateTest('var x = [{ a: 1 }];', 'let x = [{\n  a: 1\n}];'));

  it('array with 2 object elements',
    generateTest('var x = [{ a: 1 }, { b: 2 }];', 'let x = [{\n  a: 1\n}, {\n  b: 2\n}];'));

  it('array with 3 object elements',
    generateTest('var x = [{ a: 1 }, { b: 2 }, { c: 3 }];', 'let x = [{\n  a: 1\n}, {\n  b: 2\n}, {\n  c: 3\n}];'));
});

describe('unary expressions:', function () {
  it('unary not',
    generateTest('var x = !a;', 'let x = !a;'));

  it('unary plus',
    generateTest('var x = +5;', 'let x = +5;'));

  it('unary minus',
    generateTest('var x = -5;', 'let x = -5;'));

  it('typeof identifier',
    generateTest('var x = typeof a;', 'let x = typeof a === \"undefined\" ? \"undefined\" : {}.toString.call(a).match(/\\s([a-zA-Z]+)/)[1].toLowerCase();'));

  it('typeof call expression',
    generateTest('var x = typeof a();', 'let x = {}.toString.call(a()).match(/\\s([a-zA-Z]+)/)[1].toLowerCase();'));
});

describe('arithmetic expressions:', function () {
  it('plus with 2 elements',
    generateTest('var x = a+b;', 'let x = a + b;'));

  it('plus with 3 elements',
    generateTest('var x = a+b+c;', 'let x = a + b + c;'));

  it('minus with 2 elements',
    generateTest('var x = a-b;', 'let x = a - b;'));

  it('minus with 3 elements',
    generateTest('var x = a-b-c;', 'let x = a - b - c;'));

  it('multipication with 2 elements',
    generateTest('var x = a*b;', 'let x = a * b;'));

  it('multipication with 3 elements',
    generateTest('var x = a*b*c;', 'let x = a * b * c;'));

  it('division with 2 elements',
    generateTest('var x = a/b;', 'let x = a / b;'));

  it('division with 3 elements',
    generateTest('var x = a/b/c;', 'let x = a / b / c;'));

  it('order of operators',
    generateTest('var x = 3+4*5-(3+4)*5/(a+b-c*d);', 'let x = 3 + 4 * 5 - (3 + 4) * 5 / (a + b - c * d);'));

  it('exponentiation with 2 elements',
    generateTest('var x = a**b;', 'let x = Math.pow(a, b);'));

  it('exponentiation with 3 elements',
    generateTest('var x = a**b**c;', 'let x = Math.pow(Math.pow(a, b), c);'));

  it('integer division with 2 elements',
    generateTest('var x = a#b;', 'let x = Math.floor(a / b);'));

  it('integer division with 3 elements',
    generateTest('var x = a#b#c;', 'let x = Math.floor(Math.floor(a / b) / c);'));

  it('modulo with 2 elements',
    generateTest('var x = a%b;', 'let x = a % b;'));

  it('modulo with 3 elements',
    generateTest('var x = a%b%c;', 'let x = a % b % c;'));

  it('math modulo with 2 elements',
    generateTest('var x = a%%b;', 'let x = (a % b + b) % b;'));

  it('math modulo with 3 elements',
    generateTest('var x = a%%b%%c;', 'let x = ((a % b + b) % b % c + c) % c;'));
});

describe('logical expressions:', function () {
  it('AND expression',
    generateTest('var x = a && b;', 'let x = !!a && !!b;'));

  it('2 AND expressions',
    generateTest('var x = a && b && c;', 'let x = !!(!!a && !!b) && !!c;'));

  it('worded AND expression',
    generateTest('var x = a and b;', 'let x = !!a && !!b;'));

  it('2 worded AND expressions',
    generateTest('var x = a and b and c;', 'let x = !!(!!a && !!b) && !!c;'));

  it('OR expression',
    generateTest('var x = a || b;', 'let x = !!a || !!b;'));

  it('2 OR expressions',
    generateTest('var x = a || b || c;', 'let x = !!(!!a || !!b) || !!c;'));

  it('worded OR expression',
    generateTest('var x = a or b;', 'let x = !!a || !!b;'));

  it('2 worded OR expressions',
    generateTest('var x = a or b or c;', 'let x = !!(!!a || !!b) || !!c;'));

  it('order of logical expressions 1',
    generateTest('var x = a && b || c;', 'let x = !!(!!a && !!b) || !!c;'));

  it('order of logical expressions 2',
    generateTest('var x = a && b || c && d;', 'let x = !!(!!a && !!b) || !!(!!c && !!d);'));

  it('order of logical expressions 3',
    generateTest('var x = a && b || c && (d || e || f && g);', 'let x = !!(!!a && !!b) || !!(!!c && !!(!!(!!d || !!e) || !!(!!f && !!g)));'));
});

describe('binary expressions:', function () {
  it('equals expression',
    generateTest('var x = a == b;', 'let x = a === b;'));

  it('not equals expression',
    generateTest('var x = a != b;', 'let x = a !== b;'));

  it('larger expression',
    generateTest('var x = a > b;', 'let x = a > b;'));

  it('larger or equals expression',
    generateTest('var x = a >= b;', 'let x = a >= b;'));

  it('smaller expression',
    generateTest('var x = a < b;', 'let x = a < b;'));

  it('smaller or equals expression',
    generateTest('var x = a <= b;', 'let x = a <= b;'));

  it('chained comparisons',
    generateTest('var x = a > x > c;', 'let x = a > x && x > c;'));

  it('chained comparisons with 2 components',
    generateTest('var x = a > x > c > d;', 'let x = a > x && x > c && c > d;'));

  it('chained comparisons with 3 components',
    generateTest('var x = a > x > c > d > e;', 'let x = a > x && x > c && c > d && d > e;'));
});

describe('update expressions:', function () {
  it('increment statement',
    generateTest('a++;', 'a++;'));

  it('decrement statement',
    generateTest('a--;', 'a--;'));

  it('increment expression',
    generateTest('var x = a++;', 'let x = a++;'));

  it('decrement expression',
    generateTest('var x = a--;', 'let x = a--;'));

  it('increment prefix statement',
    generateTest('++a;', '++a;'));

  it('decrement prefix statement',
    generateTest('--a;', '--a;'));

  it('increment prefix expression',
    generateTest('var x = ++a;', 'let x = ++a;'));

  it('decrement prefix expression',
    generateTest('var x = --a;', 'let x = --a;'));
});

describe('assignment expressions:', function () {
  it('assignment statement',
    generateTest('a = 1;', 'a = 1;'));

  it('assignment statement with 2 variables',
    generateTest('a = b = 1;', 'a = b = 1;'));

  it('assignment statement with 3 variables',
    generateTest('a = b = c = 1;', 'a = b = c = 1;'));

  it('assignment expression',
    generateTest('var x = a = 1;', 'let x = a = 1;'));

  it('assignment expression with 2 variables',
    generateTest('var x = a = b = 1;', 'let x = a = b = 1;'));

  it('assignment expression with 3 variables',
    generateTest('var x = a = b = c = 1;', 'let x = a = b = c = 1;'));

  it('addition assignment',            generateTest('x += a;',   'x += a;'));
  it('subtraction assignment',         generateTest('x -= a;',   'x -= a;'));
  it('multiplication assignment',      generateTest('x *= a;',   'x *= a;'));
  it('division assignment',            generateTest('x /= a;',   'x /= a;'));
  it('remainder assignment',           generateTest('x %= a;',   'x %= a;'));
  it('left shift assignment',          generateTest('x <<= a;',  'x <<= a;'));
  it('right shift assignment',         generateTest('x >>= a;',  'x >>= a;'));
  it('logical right shift assignment', generateTest('x >>>= a;', 'x >>>= a;'));
  it('bitwise AND assignment',         generateTest('x &= a;',   'x &= a;'));
  it('bitwise XOR assignment',         generateTest('x ^= a;',   'x ^= a;'));
  it('bitwise OR assignment',          generateTest('x |= a;',   'x |= a;'));
  it('null coalescing assignment',     generateTest('x ?= a;',   'x = x == null ? a : x;'))
});

describe('if statement:', function () {
  it('if statement',
    generateTest('if true { }', 'if (true) {}'));

  it('if statement with else clause',
    generateTest('if true { } else { }', 'if (true) {} else {}'));

  it('if statement without block',
    generateTest('if true a();', 'if (true) {\n  a();\n}'));

  it('if statement with else without block',
    generateTest('if true a(); else b();', 'if (true) {\n  a();\n} else {\n  b();\n}'));
});

describe('for statement:', function () {
  it('for loop with empty arguments',
    generateTest('for ;; { }', 'for (;;) {}'));

  it('for loop with initialiser only',
    generateTest('for var i = 0;; { }', 'for (let i = 0;;) {}'));

  it('for loop with condition only',
    generateTest('for ; i > 0; { }', 'for (; i > 0;) {}'));

  it('for loop with update only',
    generateTest('for ;; i++ { }', 'for (;; i++) {}'));

  it('for loop with initialiser and condition',
    generateTest('for var i = 0; i > 0; { }', 'for (let i = 0; i > 0;) {}'));

  it('for loop with initialiser and update',
    generateTest('for var i = 0;; i++ { }', 'for (let i = 0;; i++) {}'));

  it('for loop with condition and update',
    generateTest('for ; i > 0; i++ { }', 'for (; i > 0; i++) {}'));

  it('for loop with initialiser, condition and update',
    generateTest('for var i = 0; i > 0; i++ { }', 'for (let i = 0; i > 0; i++) {}'));
});

describe('function declarations:', function () {
  it('fn decl without arguments',
    generateTest('fn f() { }', 'function f() {}'));

  it('fn decl with 1 argument',
    generateTest('fn f(a) { }', 'function f(a) {}'));

  it('fn decl with 2 arguments',
    generateTest('fn f(a, b) { }', 'function f(a, b) {}'));

  it('fn decl with 3 arguments',
    generateTest('fn f(a, b, c) { }', 'function f(a, b, c) {}'));
});

describe('function expressions:', function () {
  it('function expression without arguments',
    generateTest('var a = () -> 1;', 'let a = function () {\n  return 1;\n};'));

  it('function expression with 1 argument',
    generateTest('var a = (a) -> a;', 'let a = function (a) {\n  return a;\n};'));

  it('function expression with 2 arguments',
    generateTest('var a = (a, b) -> a+b;', 'let a = function (a, b) {\n  return a + b;\n};'));

  it('function expression with 3 arguments',
    generateTest('var a = (a, b, c) -> a+b-c;', 'let a = function (a, b, c) {\n  return a + b - c;\n};'));

  it('block function expression without arguments',
    generateTest('var a = () -> { };', 'let a = function () {};'));

  it('block function expression with 1 argument',
    generateTest('var a = (a) -> { };', 'let a = function (a) {};'));

  it('block function expression with 2 arguments',
    generateTest('var a = (a, b) -> { };', 'let a = function (a, b) {};'));

  it('block function expression with 3 arguments',
    generateTest('var a = (a, b, c) -> { };', 'let a = function (a, b, c) {};'));

  it('block function expression (fn syntax) without arguments',
    generateTest('var a = fn () { };', 'let a = function () {};'));

  it('block function expression (fn syntax) with 1 argument',
    generateTest('var a = fn (a) { };', 'let a = function (a) {};'));

  it('block function expression (fn syntax) with 2 arguments',
    generateTest('var a = fn (a, b) { };', 'let a = function (a, b) {};'));

  it('block function expression (fn syntax) with 3 arguments',
    generateTest('var a = fn (a, b, c) { };', 'let a = function (a, b, c) {};'));

  it('block function expression (fn syntax with id) without arguments',
    generateTest('var a = fn f() { };', 'let a = function f() {};'));

  it('block function expression (fn syntax with id) with 1 argument',
    generateTest('var a = fn f(a) { };', 'let a = function f(a) {};'));

  it('block function expression (fn syntax with id) with 2 arguments',
    generateTest('var a = fn f(a, b) { };', 'let a = function f(a, b) {};'));

  it('block function expression (fn syntax with id) with 3 arguments',
    generateTest('var a = fn f(a, b, c) { };', 'let a = function f(a, b, c) {};'));
});

/*describe('javascript literal expression:', function() {
  it('javascript expression with normal var declaration',
    generateTest('@js { var a; }', 'var a;'));
});*/

describe('return statement:', function () {
  it('function declaration with a return statement',
    generateTest('fn x() { return 1; }',
      'function x() {\n  return 1;\n}'));

  it('function expression with a return statement',
    generateTest('var a = () -> { return 1; };', 'let a = function () {\n  return 1;\n};'));

  it('function declaration with empty return statement',
    generateTest('fn x() { return; }',
      'function x() {\n  return;\n}'));

  it('function expression with empty return statement',
    generateTest('var a = () -> { return; };', 'let a = function () {\n  return;\n};'));
});

describe('global identifiers and use statements:', function () {
  it('global function call',
    generateErrorTest('x("test");',
      [{ type: 'UndefinedIdentifier', 'identifier': 'x' }]));

  it('global function call with :: operator',
    generateTest('::x("test");', 'x("test");'));

  it('global function call with use statement',
    generateTest('use x; x("test");', 'x("test");'));

  it('global function call with use statement and :: operator',
    generateTest('use x; ::x("test");', 'x("test");'));

  it('global function call with use statement after the function call',
    generateErrorTest('x("test"); use x;',
      [{ type: 'UndefinedIdentifier', 'identifier': 'x' }]));

  it('global member expression',
    generateErrorTest('var x = a.b;',
      [{ type: 'UndefinedIdentifier', 'identifier': 'a' }]));

  it('global member expression with :: operator',
    generateTest('var x = ::a.b;', 'let x = a.b;'));

  it('global member expression with use statement',
    generateTest('use a; var x = a.b;', 'let x = a.b;'));

  it('global member expression with use statement and :: operator',
    generateTest('use a; var x = ::a.b;', 'let x = a.b;'));

  it('global member expression with use statement after the member expression',
    generateErrorTest('var x = a.b; use a;',
      [{ type: 'UndefinedIdentifier', 'identifier': 'a' }]));

  it('use statement with 2 identifiers',
    generateErrorTest('use a, b; var x = a + b;', []));

  it('use statement with 3 identifiers',
    generateErrorTest('use a, b, c; var x = a + b + c;', []));

  it(':browser use statement',
    generateErrorTest('use :browser; var x = document + console + window;', []));
});

describe('this keyword:', function () {
  it('call statement with this',
    generateTest('this.x();', 'this.x();'));
  it('call expression with this',
    generateTest('var a = this.x();', 'let a = this.x();'));
  it('member expression with this',
    generateTest('var a = this.x;', 'let a = this.x;'));
  it('call statement and member expression with this',
    generateTest('this.a.b();', 'this.a.b();'));
});

describe('fn extends:', function () {
  it('extended function with no constructor',
    generateTest('fn A() {} fn B() extends A {}',
      'function A() {}\n\nfunction B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);'));

  it('extended function with empty constructor',
    generateTest('fn A() {} fn B() extends A() {}',
      'function A() {}\n\nfunction B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);'));

  it('extended function with 1-param constructor',
    generateTest('fn A() {} fn B() extends A(1) {}',
      'function A() {}\n\nfunction B() {\n  A.call(this, 1);\n}\n\nB.prototype = Object.create(A);'));

  it('extended function with 2-params constructor',
    generateTest('fn A() {} fn B(a) extends A(1, a) {}',
      'function A() {}\n\nfunction B(a) {\n  A.call(this, 1, a);\n}\n\nB.prototype = Object.create(A);'));

  it('extended function with global identifier',
    generateTest('fn B() extends ::A {}',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);'));

  it('extended function expression with no constructor',
    generateTest('var A = fn () {}; var B = fn () extends A {};', 'let A = function () {};\n\nlet functionExpression0 = function () {\n  A.call(this);\n};\n\nfunctionExpression0.prototype = Object.create(A);\nlet B = functionExpression0;'));

  it('extended function expression with empty constructor',
    generateTest('var A = fn () {}; var b = fn () extends A() {};', 'let A = function () {};\n\nlet functionExpression0 = function () {\n  A.call(this);\n};\n\nfunctionExpression0.prototype = Object.create(A);\nlet b = functionExpression0;'));

  it('extended function expression with 1-param constructor',
    generateTest('var A = fn () {}; var B = fn () extends A(1) {};', 'let A = function () {};\n\nlet functionExpression0 = function () {\n  A.call(this, 1);\n};\n\nfunctionExpression0.prototype = Object.create(A);\nlet B = functionExpression0;'));

  it('extended function expression with 2-params constructor',
    generateTest('var A = fn () {}; var B = fn (a) extends A(1, a) {};', 'let A = function () {};\n\nlet functionExpression0 = function (a) {\n  A.call(this, 1, a);\n};\n\nfunctionExpression0.prototype = Object.create(A);\nlet B = functionExpression0;'));

  it('extended function expression with global identifier',
    generateTest('var B = fn () extends ::A {};', 'let functionExpression0 = function () {\n  A.call(this);\n};\n\nfunctionExpression0.prototype = Object.create(A);\nlet B = functionExpression0;'));
});

describe('super keyword:', function () {
  it('super call statement in a method',
    generateTest('fn B() extends ::A { this.test = fn () { super.test(); }; }',
      'function B() {\n  A.call(this);\n\n  let _self = this;\n\n  let _test = this.test;\n\n  this.test = function () {\n    _test.call(_self);\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super call statement in a method inside an anonymous function',
    generateTest('fn B() extends ::A { this.test = fn () { (() -> { return super.test(); })(); }; }',
      'function B() {\n  A.call(this);\n\n  let _self = this;\n\n  let _test = this.test;\n\n  this.test = function () {\n    (function () {\n      return _test.call(_self);\n    })();\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super call statement in a method inside 2 anonymous functions',
    generateTest('fn B() extends ::A { this.test = fn () { (() -> () -> { return super.test(); } )()(); }; }',
      'function B() {\n  A.call(this);\n\n  let _self = this;\n\n  let _test = this.test;\n\n  this.test = function () {\n    (function () {\n      return function () {\n        return _test.call(_self);\n      };\n    })()();\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super member expression in a method',
    generateTest('fn B() extends ::A { this.test = fn () { var x = super.x; }; }',
      'function B() {\n  A.call(this);\n  let _x = this.x;\n\n  this.test = function () {\n    let x = _x;\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super member expression in a method inside an anonymous function',
    generateTest('fn B() extends ::A { this.test = fn () { var x = (() -> super.x)(); }; }',
      'function B() {\n  A.call(this);\n  let _x = this.x;\n\n  this.test = function () {\n    let x = function () {\n      return _x;\n    }();\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super member expression in a method inside 2 anonymous functions',
    generateTest('fn B() extends ::A { this.test = fn () { var x = (() -> () -> super.x)()(); }; }',
      'function B() {\n  A.call(this);\n\  let _x = this.x;\n\n  this.test = function () {\n    let x = function () {\n      return function () {\n        return _x;\n      };\n    }()();\n  };\n}\n\nB.prototype = Object.create(A);'));

  it('super call statement in a prototype function',
    generateTest('fn B() extends ::A {} B.prototype.test = () -> { super.test(); };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\n\nB.prototype.test = function () {\n  A.prototype.test.call(this);\n};'));

  it('super call statement in a prototype function inside an anonymous function',
    generateTest('fn B() extends ::A {} B.prototype.test = () -> { (() -> super.test())(); };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\n\nB.prototype.test = function () {\n  let _self = this;\n\n  (function () {\n    return A.prototype.test.call(_self);\n  })();\n};'));

  it('super member expression in a prototype function',
    generateTest('fn B() extends ::A {} B.prototype.test = () -> { var x = super.x; };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\n\nB.prototype.test = function () {\n  let x = this.x;\n};'));

  it('super member expression in a prototype function inside an anonymous function',
    generateTest('fn B() extends ::A {} B.prototype.test = () -> { var x = (() -> { return super.x; })(); };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\n\nB.prototype.test = function () {\n  let _self = this;\n\n  let x = function () {\n    return _self.x;\n  }();\n};'));

  it('super call statement in a prototype object',
    generateTest('fn B() extends ::A {} B.prototype = { test: () -> { super.test(); } };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\nB.prototype = {\n  test: function () {\n    A.prototype.test.call(this);\n  }\n};'));

  it('super call statement in a prototype object inside an anonymous function',
    generateTest('fn B() extends ::A {} B.prototype = { test: () -> { (() -> super.test())(); } };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\nB.prototype = {\n  test: function () {\n    let _self = this;\n\n    (function () {\n      return A.prototype.test.call(_self);\n    })();\n  }\n};'));

  it('super member expression in a prototype object',
    generateTest('fn B() extends ::A {} B.prototype = { test: () -> { var x = super.x; } };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\nB.prototype = {\n  test: function () {\n    let x = this.x;\n  }\n};'));

  it('super member expression in a prototype object inside an anonymous function',
    generateTest('fn B() extends ::A {} B.prototype = { test: () -> { var x = (() -> { return super.x; })(); } };',
      'function B() {\n  A.call(this);\n}\n\nB.prototype = Object.create(A);\nB.prototype = {\n  test: function () {\n    let _self = this;\n\n    let x = function () {\n      return _self.x;\n    }();\n  }\n};'));
});

describe('string interpolation:', function () {
  it('string interpolation',
    generateTest('var x = "test \\(a) test \\(2+a) \\(Math.pow(2, a)) test test";', 'let x = \"test \" + a + \" test \" + (2 + a) + \" \" + Math.pow(2, a) + \" test test\";'));
});

describe('bitwise opreators:', function () {
  it('bitwise AND', generateTest('var x = a & b;', 'let x = a & b;'));
  it('bitwise OR',  generateTest('var x = a | b;', 'let x = a | b;'));
  it('bitwise XOR', generateTest('var x = a ^ b;', 'let x = a ^ b;'));

  it('arithmetic shift left',  generateTest('var x = a << b;', 'let x = a << b;'));
  it('arithmetic shift right', generateTest('var x = a >> b;', 'let x = a >> b;'));

  it('logical shift right', generateTest('var x = a >>> b;', 'let x = a >>> b;'));
});

describe('throw statement:', function () {
  it('throw number', generateTest('throw 5;', 'throw 5;'));
  it('throw object', generateTest('throw { message: "test" };', 'throw {\n  message: "test"\n};'));
});

describe('control flow statements:', function () {
  it('break statement', generateTest('break;', 'break;'));
  it('continue statement', generateTest('continue;', 'continue;'));
});

describe('range expressions:', function () {
  it('upward small inclusive numeric range expression',
    generateTest('var x = [1..5];', 'let x = [1, 2, 3, 4, 5];'));

  it('downward small inclusive numeric range expression',
    generateTest('var x = [5..1];', 'let x = [5, 4, 3, 2, 1];'));

  it('upward small exclusive numeric range expression',
    generateTest('var x = [1...5];', 'let x = [1, 2, 3, 4];'));

  it('downward small exclusive numeric range expression',
    generateTest('var x = [5...1];', 'let x = [5, 4, 3, 2];'));

  it('upward large inclusive numeric range expression',
    generateTest('var x = [1..25];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = 1; _i <= 25; _i++) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('downward large inclusive numeric range expression',
    generateTest('var x = [25..1];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = 25; _i >= 1; _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('upward large exclusive numeric range expression',
    generateTest('var x = [1...25];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = 1; _i < 25; _i++) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('downward large exclusive numeric range expression',
    generateTest('var x = [25...1];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = 25; _i > 1; _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('inclusive identifiers range expression',
    generateTest('var x = [a..b];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = a; a <= b ? _i <= b : _i >= b; a <= b ? _i++ : _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('exclusive identifiers range expression',
    generateTest('var x = [a...b];', 'let x = function () {\n  let _results = [];\n\n  for (let _i = a; a <= b ? _i < b : _i > b; a <= b ? _i++ : _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('inclusive call range expression',
    generateTest('var x = [a()..b()];', 'let x = function () {\n  let _results = [],\n      _start = a(),\n      _end = b();\n\n  for (let _i = _start; _start <= _end ? _i <= _end : _i >= _end; _start <= _end ? _i++ : _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));

  it('exclusive call range expression',
    generateTest('var x = [a()...b()];', 'let x = function () {\n  let _results = [],\n      _start = a(),\n      _end = b();\n\n  for (let _i = _start; _start <= _end ? _i < _end : _i > _end; _start <= _end ? _i++ : _i--) {\n    _results.push(_i);\n  }\n\n  return _results;\n}.apply(this);'));
});

describe('debugger statement:', function () {
  it('debugger statement', generateTest('debugger;', 'debugger;'));
});

describe('while and until statements:', function () {
  it('while statement', generateTest('while true {}', 'while (true) {}'));
  it('while statement without block', generateTest('while true a();', 'while (true) {\n  a();\n}'));

  it('until statement', generateTest('until true {}', 'while (!true) {}'));
  it('until statement without block', generateTest('until true a();', 'while (!true) {\n  a();\n}'));
});

describe('array slicing:', function () {
  it('inclusive array slice with empty from and to',
    generateTest('var x = a[..];', 'let x = a.slice(0);'));

  it('inclusive array slice with numeric from and empty to',
    generateTest('var x = a[1..];', 'let x = a.slice(1);'));

  it('inclusive array slice with empty from and numeric to',
    generateTest('var x = a[..1];', 'let x = a.slice(0, 2);'));

  it('inclusive array slice with numeric from and numeric to',
    generateTest('var x = a[1..2];', 'let x = a.slice(1, 3);'));

  it('inclusive array slice with identifier from and empty to',
    generateTest('var x = a[c..];', 'let x = a.slice(c);'));

  it('inclusive array slice with empty from and identifier to',
    generateTest('var x = a[..c];', 'let x = a.slice(0, c + 1);'));

  it('inclusive array slice with identifier from and identifier to',
    generateTest('var x = a[c..d];', 'let x = a.slice(c, d + 1);'));

  it('exclusive array slice with empty from and to',
    generateTest('var x = a[...];', 'let x = a.slice(0);'));

  it('exclusive array slice with numeric from and empty to',
    generateTest('var x = a[1...];', 'let x = a.slice(1);'));

  it('exclusive array slice with empty from and numeric to',
    generateTest('var x = a[...1];', 'let x = a.slice(0, 1);'));

  it('exclusive array slice with numeric from and numeric to',
    generateTest('var x = a[1...2];', 'let x = a.slice(1, 2);'));

  it('exclusive array slice with identifier from and empty to',
    generateTest('var x = a[c...];', 'let x = a.slice(c);'));

  it('exclusive array slice with empty from and identifier to',
    generateTest('var x = a[...c];', 'let x = a.slice(0, c);'));

  it('exclusive array slice with identifier from and identifier to',
    generateTest('var x = a[c...d];', 'let x = a.slice(c, d);'));
});

describe('array splicing:', function () {
  it('inclusive array splicing with empty from and to',
    generateTest('a[..] = [x];', '[].splice.apply(a, [0, 9000000000].concat([x]));'));

  it('inclusive array splicing with numeric from and empty to',
    generateTest('a[1..] = [x];', '[].splice.apply(a, [1, 9000000000].concat([x]));'));

  it('inclusive array splicing with empty from and numeric to',
    generateTest('a[..3] = [x];', '[].splice.apply(a, [0, 4].concat([x]));'));

  it('inclusive array splicing with numeric from and numeric to',
    generateTest('a[2..3] = [x];', '[].splice.apply(a, [2, 2].concat([x]));'));

  it('inclusive array splicing with identifier from and empty to',
    generateTest('a[t..] = [x];', '[].splice.apply(a, [t, 9000000000].concat([x]));'));

  it('inclusive array splicing with empty from and numeric to',
    generateTest('a[..v] = [x];', '[].splice.apply(a, [0, v + 1].concat([x]));'));

  it('inclusive array splicing with numeric from and numeric to',
    generateTest('a[t..v] = [x];', '[].splice.apply(a, [t, v - t + 1].concat([x]));'));

  it('exclusive array splicing with empty from and to',
    generateTest('a[...] = [x];', '[].splice.apply(a, [0, 9000000000].concat([x]));'));

  it('exclusive array splicing with numeric from and empty to',
    generateTest('a[1...] = [x];', '[].splice.apply(a, [1, 9000000000].concat([x]));'));

  it('exclusive array splicing with empty from and numeric to',
    generateTest('a[...3] = [x];', '[].splice.apply(a, [0, 3].concat([x]));'));

  it('exclusive array splicing with numeric from and numeric to',
    generateTest('a[2...3] = [x];', '[].splice.apply(a, [2, 1].concat([x]));'));

  it('exclusive array splicing with identifier from and empty to',
    generateTest('a[t...] = [x];', '[].splice.apply(a, [t, 9000000000].concat([x]));'));

  it('exclusive array splicing with empty from and numeric to',
    generateTest('a[...v] = [x];', '[].splice.apply(a, [0, v].concat([x]));'));

  it('exclusive array splicing with numeric from and numeric to',
    generateTest('a[t...v] = [x];', '[].splice.apply(a, [t, v - t].concat([x]));'));
});

describe('new expressions:', function () {
  it('new expression with 0 arguments',
    generateTest('var x = new A();', 'let x = new A();'));

  it('new expression with 1 argument',
    generateTest('var x = new A(1);', 'let x = new A(1);'));

  it('new expression with 2 argument',
    generateTest('var x = new A(1, b());', 'let x = new A(1, b());'));
});

describe('default fn param value:', function () {
  it('fn decl with 1 param with default value',
    generateTest('fn f(a = 5) {}',
      'function f(a = 5) {}'));

  it('fn decl with 2 params with default values',
    generateTest('fn f(a = 5, b = 3) {}',
      'function f(a = 5, b = 3) {}'));

  it('fn decl with 2 params - first with default value and second without',
    generateTest('fn f(a = 5, b) {}',
      'function f(a = 5, b) {}'));

  it('fn decl with 2 params - second with default value and first without',
    generateTest('fn f(a, b = 3) {}',
      'function f(a, b = 3) {}'));

  it('fn decl with 3 params with default values',
    generateTest('fn f(a = 5, b = 3, k = { test: 1 }) {}',
      'function f(a = 5, b = 3, k = {\n  test: 1\n}) {}'));

  it('fn expression with 1 param with default value',
    generateTest('var x = (a = 5) -> a;', 'let x = function (a = 5) {\n  return a;\n};'));

  it('fn expression with 2 params with default values',
    generateTest('var x = fn (a = 5, b = 3) {};', 'let x = function (a = 5, b = 3) {};'));

  it('fn expression with 2 params - first with default value and second without',
    generateTest('var x = fn (a = 5, b) {};', 'let x = function (a = 5, b) {};'));

  it('fn expression with 2 params - second with default value and first without',
    generateTest('var x = fn (a, b = 3) {};', 'let x = function (a, b = 3) {};'));

  it('fn expression with 3 params with default values',
    generateTest('var x = fn (a = 5, b = 3, k = { test: 1 }) {};', 'let x = function (a = 5, b = 3, k = {\n  test: 1\n}) {};'));
});

describe('splat in function declaration:', function () {
  it('fn decl with splat',
    generateTest('fn f(a...) {}',
      'function f() {\n  let __splat,\n      a = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];\n}'));

  it('fn decl with splat, parameter',
    generateTest('fn f(a..., b) {}',
      'function f() {\n  let __splat,\n      a = 2 <= arguments.length ? [].slice.call(arguments, 0, __splat = arguments.length - 1) : (__splat = 0, []),\n      b = arguments[__splat++];\n}'));

  it('fn decl with parameter, splat',
    generateTest('fn f(a, b...) {}',
      'function f() {\n  let __splat,\n      a = arguments[0],\n      b = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];\n}'));

  it('fn decl with parameter, splat, parameter',
    generateTest('fn f(a, b..., c) {}',
      'function f() {\n  let __splat,\n      a = arguments[0],\n      b = 3 <= arguments.length ? [].slice.call(arguments, 1, __splat = arguments.length - 1) : (__splat = 1, []),\n      c = arguments[__splat++];\n}'));

  it('fn decl with parameter, parameter, splat, parameter',
    generateTest('fn f(a, b, c..., d) {}',
      'function f() {\n  let __splat,\n      a = arguments[0],\n      b = arguments[1],\n      c = 4 <= arguments.length ? [].slice.call(arguments, 2, __splat = arguments.length - 1) : (__splat = 2, []),\n      d = arguments[__splat++];\n}'));

  it('fn decl with parameter, splat, parameter, parameter',
    generateTest('fn f(a, b..., c, d) {}',
      'function f() {\n  let __splat,\n      a = arguments[0],\n      b = 4 <= arguments.length ? [].slice.call(arguments, 1, __splat = arguments.length - 2) : (__splat = 1, []),\n      c = arguments[__splat++],\n      d = arguments[__splat++];\n}'));

  it('multiple splats in fn decl',
    generateErrorTest('fn f(a..., b...) {}', [{ type: "MultipleSplatsDisallowed" }]));
});

describe('splat in call expressions:', function () {
  it('call expression with a splat',
    generateTest('f(a...);', 'f.apply(null, a);'));

  it('call expression with splat, argument',
    generateTest('f(a..., b);', 'f.apply(null, [].slice.call(a).concat([b]));'));

  it('call expression with argument, splat',
    generateTest('f(a, b...);', 'f.apply(null, [a].concat([].slice.call(b)));'));

  it('call expression with splat, argument, argument',
    generateTest('f(a..., b, c);', 'f.apply(null, [].slice.call(a).concat([b], [c]));'));

  it('call expression with argument, splat, argument',
    generateTest('f(a, b..., c);', 'f.apply(null, [a].concat([].slice.call(b), [c]));'));

  it('call expression with argument, argument, splat, argument',
    generateTest('f(a, b, c..., d);', 'f.apply(null, [a, b].concat([].slice.call(c), [d]));'));

  it('null check call expression with a splat',
    generateTest('f?(a...);', 'if (typeof f === \"function\") {\n  f.apply(null, a);\n}'));

  it('null check call expression with splat, argument',
    generateTest('f?(a..., b);', 'if (typeof f === \"function\") {\n  f.apply(null, [].slice.call(a).concat([b]));\n}'));

  it('null check call expression with argument, splat',
    generateTest('f?(a, b...);', 'if (typeof f === \"function\") {\n  f.apply(null, [a].concat([].slice.call(b)));\n}'));

  it('null check call expression with splat, argument, argument',
    generateTest('f?(a..., b, c);', 'if (typeof f === \"function\") {\n  f.apply(null, [].slice.call(a).concat([b], [c]));\n}'));

  it('null check call expression with argument, splat, argument',
    generateTest('f?(a, b..., c);', 'if (typeof f === \"function\") {\n  f.apply(null, [a].concat([].slice.call(b), [c]));\n}'));

  it('null check call expression with argument, argument, splat, argument',
    generateTest('f?(a, b, c..., d);', 'if (typeof f === \"function\") {\n  f.apply(null, [a, b].concat([].slice.call(c), [d]));\n}'));
});

describe('conditional expressions:', function () {
  it('conditional expression',
    generateTest('var x = a() if b else c();', 'let x = b ? a() : c();'));
});

describe('for in statement:', function () {
  it('for in statement without index',
    generateTest('for item in array {}',
      'for (let item of array) {}'));

  it('for in statement with index',
    generateTest('for item, index in array {}',
      'let index = 0;\n\nfor (let item of array) {\n  index++;\n}'));
});

describe('for of statement:', function () {
  it('for of statement without value',
    generateTest('for key of object {}',
      'for (let key of Object.keys(object)) {}'));

  it('for of statement with value',
    generateTest('for key, value of object {}',
      'for (let key of Object.keys(object)) {\n  let value = object[key];\n}'));

  it('for of statement of call expression without value',
    generateTest('for key of f() {}',
      'for (let key of Object.keys(f())) {}'));

  it('for of statement of call expression  with value',
    generateTest('for key, value of f() {}',
      'let forOf0 = f();\n\nfor (let key of Object.keys(forOf0)) {\n  let value = forOf0[key];\n}'));
});

describe('try statement:', function () {
  it('try statement without handler with finalizer',
    generateTest('try { a(); } finally { b(); }',
      'try {\n  a();\n} finally {\n  b();\n}'));

  it('try statement with handler without finalizer',
    generateTest('try { a(); } catch error { b(); }',
      'try {\n  a();\n} catch (error) {\n  b();\n}'));

  it('try statement with handler and finalizer',
    generateTest('try { a(); } catch error { b(); } finally { c(); }',
      'try {\n  a();\n} catch (error) {\n  b();\n} finally {\n  c();\n}'));
});

describe('in expression:', function () {
  it('in expression with identifier',
    generateTest('var x = a in b;', 'let x = b instanceof Array ? b.indexOf(a) !== -1 : a in b;'));

  it('in expression with call expression',
    generateTest('var x = a in b();', 'let inExpression0 = b();\nlet x = inExpression0 instanceof Array ? inExpression0.indexOf(a) !== -1 : a in inExpression0;'));
});

describe('list comprehensions:', function () {
  it('list comprehension without condition and without index',
    generateTest('var x = [item + 1 for item in array];',
      'let x = function () {\n  let forIn0 = [];\n\n  for (let item of array) {\n    forIn0.push(item + 1);\n  }\n\n  return forIn0;\n}();'));

  it('list comprehension with condition and without index',
    generateTest('var x = [item + 1 for item in array if condition];',
      'let x = function () {\n  let forIn0 = [];\n\n  for (let item of array) {\n    if (condition) {\n      forIn0.push(item + 1);\n    }\n  }\n\n  return forIn0;\n}();'));

  it('list comprehension without condition and with index',
    generateTest('var x = [item + index for item, index in array];',
      'let x = function () {\n  let forIn0 = [];\n  let index = 0;\n\n  for (let item of array) {\n    forIn0.push(item + index);\n    index++;\n  }\n\n  return forIn0;\n}();'));

 it('list comprehension with condition and with index',
    generateTest('var x = [item + index for item, index in array if index > 1];',
      'let x = function () {\n  let forIn0 = [];\n  let index = 0;\n\n  for (let item of array) {\n    if (index > 1) {\n      forIn0.push(item + index);\n    }\n\n    index++;\n  }\n\n  return forIn0;\n}();'));
});

describe('switch statement:', function () {
  it('switch statement with single case',
    generateTest('switch n { case 1: { } }',
      'if (n === 1) {}'));

  it('switch statement with 2 cases',
    generateTest('switch n { case 1: { }, case 2: { } }',
      'if (n === 1) {} else if (n === 2) {}'));

  it('switch statement with 2 cases with multiple options',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {}'));

  it('switch statement with 2 cases with multiple options and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else {}'));

  it('switch statement with 2 cases with multiple options, inclusive range case and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case 5..6: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n >= 5 && n <= 6) {} else {}'));

  it('switch statement with 2 cases with multiple options, inclusive range case without from and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case ..6: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n <= 6) {} else {}'));

  it('switch statement with 2 cases with multiple options, inclusive range case without to and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case 5..: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n >= 5) {} else {}'));

  it('switch statement with 2 cases with multiple options, exclusive range case and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case 5...6: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n >= 5 && n < 6) {} else {}'));

  it('switch statement with 2 cases with multiple options, exclusive range case without from and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case ...6: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n < 6) {} else {}'));

  it('switch statement with 2 cases with multiple options, exclusive range case without to and default case',
    generateTest('switch n { case 1, 2: { }, case 3, 4: { }, case 5...: { }, default: { } }',
      'if (n === 1 || n === 2) {} else if (n === 3 || n === 4) {} else if (n >= 5) {} else {}'));

  it('switch statement with single default case',
    generateErrorTest('switch ::n { default: { } }',
      [{ "type": "SingleDefaultClause" }]));

  it('switch statement with range case without from and without to',
    generateErrorTest('switch ::n { case ..: { } }',
      [{ "type": "EmptyRange" }]));
});

describe('fallthrough statement:', function () {
  it('switch with 2 fallthrough cases',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); fallthrough; } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}'));

  it('switch with 3 fallthrough cases',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); fallthrough; }, case 1..6: { c(); fallthrough; } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n  fallthrough0 = 1;\n}'));

  it('switch with fallthrough-normal-fallthrough cases',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); }, case 1..6: { c(); fallthrough; } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n  fallthrough0 = 1;\n}'));

  it('switch with fallthrough-normal-normal-fallthrough cases',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); }, case 1..6: { c(); }, case 1..8: { d(); fallthrough; } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 8) {\n  fallthrough0 = 2;\n  d();\n  fallthrough0 = 1;\n}'));

  it('switch with normal-fallthrough-normal-fallthrough cases',
    generateTest('switch n { case 1..2: { a(); }, case 1..4: { b(); fallthrough; }, case 1..6: { c(); }, case 1..8: { d(); fallthrough; } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n} else if (n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 8) {\n  fallthrough0 = 2;\n  d();\n  fallthrough0 = 1;\n}'));

  it('switch with 2 fallthrough cases with default',
    generateTest('switch n() { case a(): { a(); fallthrough; }, case 1..4: { b(); fallthrough; }, default: { def(); } }', 'let fallthrough0 = 0;\nlet switchStatement0 = n();\n\nif (fallthrough0 < 2 && switchStatement0 >= 1 && switchStatement0 <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2) {\n  def();\n}\n\nif (switchStatement0 === a()) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}'));

  it('switch with 3 fallthrough cases with default',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); fallthrough; }, case 1..6: { c(); fallthrough; }, default: { def(); } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2) {\n  def();\n}'));

  it('switch with fallthrough-normal-fallthrough cases with default',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); }, case 1..6: { c(); fallthrough; }, default: { def(); } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2) {\n  def();\n}'));

  it('switch with fallthrough-normal-normal-fallthrough cases with default',
    generateTest('switch n { case 1..2: { a(); fallthrough; }, case 1..4: { b(); }, case 1..6: { c(); }, case 1..8: { d(); fallthrough; }, default: { def(); } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 8) {\n  fallthrough0 = 2;\n  d();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2) {\n  def();\n}'));

  it('switch with normal-fallthrough-normal-fallthrough cases with default',
    generateTest('switch n { case 1..2: { a(); }, case 1..4: { b(); fallthrough; }, case 1..6: { c(); }, case 1..8: { d(); fallthrough; }, default: { def(); } }', 'let fallthrough0 = 0;\n\nif (n >= 1 && n <= 2) {\n  fallthrough0 = 2;\n  a();\n} else if (n >= 1 && n <= 4) {\n  fallthrough0 = 2;\n  b();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2 && n >= 1 && n <= 6) {\n  fallthrough0 = 2;\n  c();\n} else if (fallthrough0 < 2 && n >= 1 && n <= 8) {\n  fallthrough0 = 2;\n  d();\n  fallthrough0 = 1;\n}\n\nif (fallthrough0 < 2) {\n  def();\n}'));
});

describe('fat arrow:', function () {
  it('fat arrow function expression',
    generateTest('var x = () => this.test;', 'let x = () => {\n  return this.test;\n};'));

  it('fat arrow function expression inside another',
    generateTest('var x = () => () => this.test;', 'let x = () => {\n  return () => {\n    return this.test;\n  };\n};'));
});

describe('for-in and for-of with break and return:', function () {
  it('for-in with break',
    generateTest('for x in array { break; }',
      'for (let x of array) {\n  break;\n}'));

  it('for-in with conditional break',
    generateTest('for x in array { if x == 5 { break; } }',
      'for (let x of array) {\n  if (x === 5) {\n    break;\n  }\n}'));

  it('for-in with return',
    generateTest('for x in array { return 5; }',
      'for (let x of array) {\n  return 5;\n}'));

  it('for-in with return w/o argument',
    generateTest('for x in array { return; }',
      'for (let x of array) {\n  return;\n}'));

  it('for-in with conditional return',
    generateTest('for x in array { if x == 5 { return 5; } }',
      'for (let x of array) {\n  if (x === 5) {\n    return 5;\n  }\n}'));

  it('for-of with break',
    generateTest('for x of obj { break; }',
      'for (let x of Object.keys(obj)) {\n  break;\n}'));

  it('for-of with conditional break',
    generateTest('for x of obj { if x == 5 { break; } }',
      'for (let x of Object.keys(obj)) {\n  if (x === 5) {\n    break;\n  }\n}'));

  it('for-of with return',
    generateTest('for x of obj { return 5; }',
      'for (let x of Object.keys(obj)) {\n  return 5;\n}'));

  it('for-of with conditional return',
    generateTest('for x of obj { if x == 5 { return 5; } }',
      'for (let x of Object.keys(obj)) {\n  if (x === 5) {\n    return 5;\n  }\n}'));
});

describe('regular expression literals:', function () {
  it('regular expression literal',
    generateTest('var re = /ab+c/g;', 'let re = /ab+c/g;'));
});

describe('import statement:', function () {
  it('import with 1 identifier',
    generateTest('import foo from "foobar";',
      'import { foo } from \"foobar\";'));

  it('import with 2 identifiers',
    generateTest('import foo, bar from "foobar";',
      'import { foo, bar } from \"foobar\";'));

  it('import with 1 identifier with as',
    generateTest('import foo as a from "foobar";',
      'import { foo as a } from \"foobar\";'));

  it('import with 2 identifiers with as',
    generateTest('import foo as a, bar as b from "foobar";',
      'import { foo as a, bar as b } from \"foobar\";'));

  it('batch import',
    generateTest('import * as lib from "lib";',
      'import * as lib from \"lib\";'));

  it('import default',
    generateTest('import "jquery" as $;',
      'import $ from "jquery";'));
});

describe('export statement:', function () {
  it('export with 1 identifier',
    generateTest('export foo;',
      'export { foo };'));

  it('export with 2 identifiers',
    generateTest('export foo, bar;',
      'export { foo, bar };'));

  it('export with 1 identifier with as',
    generateTest('export foo as f;',
      'export { foo as f };'));

  it('export with 2 identifiers with as',
    generateTest('export foo as f, bar as b;',
      'export { foo as f, bar as b };'));

  it('export with 1 identifier with source',
    generateTest('export foo from "foo";',
      'export { foo } from \"foo\";'));

  it('export with 2 identifiers with source',
    generateTest('export foo, bar from "foobar";',
      'export { foo, bar } from \"foobar\";'));

  it('batch export',
    generateTest('export * from "foobar";',
      'export * from \"foobar\";'));

  it('export variable statement',
    generateTest('export var sqrt = Math.sqrt;',
      'export let sqrt = Math.sqrt;'));

  it('export function statement',
    generateTest('export fn x() {}',
      'export function x() {}'));

  it('export function statement with extends',
    generateTest('export fn x() extends A {}',
      'export function x() {\n  A.call(this);\n}\nx.prototype = Object.create(A);'));

  it('export default identifier',
    generateTest('export default x;',
      'export default x;'));

  it('export default function expression',
    generateTest('export default () -> {};',
      'export default (function () {});'));
});

describe('curried functions:', function () {
  it('single function curry',
    generateTest('var x = a^(1);',
      'let x = function () {\n  return a.apply(this, [1].concat([].slice.apply(arguments)));\n};'));

  it('double function curry',
    generateTest('var x = a^(1)^(2, 3);',
      'let x = function () {\n  return function () {\n    return a.apply(this, [1].concat([].slice.apply(arguments)));\n  }.apply(this, [2, 3].concat([].slice.apply(arguments)));\n};'));

  it('single function curry with member expression',
    generateTest('var x = m.a^(1);',
      'let x = function () {\n  return m.a.apply(this, [1].concat([].slice.apply(arguments)));\n};'));

  it('double function curry with member expression',
    generateTest('var x = m.a^(1)^(2, 3);',
      'let x = function () {\n  return function () {\n    return m.a.apply(this, [1].concat([].slice.apply(arguments)));\n  }.apply(this, [2, 3].concat([].slice.apply(arguments)));\n};'));

  it('curry function with splats',
    generateErrorTest('var x = ::a^(::s...);',
      [{ type: "InvalidFunctionCurrying" }]));

  it('curry function with null propagating operator',
    generateErrorTest('var x = ::m?.a^();',
      [{ type: "InvalidFunctionCurrying" }]));
});

describe('destructuring assignment:', function () {
  it('array pattern destructuring assignment',
    generateTest('var [m, d, y] = [3, 14, 1977];',
      'let [m, d, y] = [3, 14, 1977];'));

  it('array pattern destructuring assignment with 1 null',
    generateTest('var [, d, y] = [3, 14, 1977];',
      'let [, d, y] = [3, 14, 1977];'));

  it('array pattern destructuring assignment with 2 nulls',
    generateTest('var [, , y] = [3, 14, 1977];',
      'let [,, y] = [3, 14, 1977];'));

  it('array pattern destructuring assignment with sub array pattern',
    generateTest('var [,, [a,b,c]] = [3, 14, [1,2,3]];',
      'let [,, [a, b, c]] = [3, 14, [1, 2, 3]];'));

  it('object pattern destructuring assignment',
    generateTest('var { x: x } = f;',
      'let {\n  x: x\n} = f;'));

  it('object pattern destructuring assignment with 2 properties',
    generateTest('var { x: x, y: test } = f;',
      'let {\n  x: x,\n  y: test\n} = f;'));

  it('object pattern destructuring assignment with sub object pattern',
    generateTest('var { x: x, y: { b: b } } = f;',
      'let {\n  x: x,\n  y: {\n    b: b\n  }\n} = f;'));

  it('swap',
    generateTest('[x,y]=[y,x];',
      '[x, y] = [y, x];'));
});

describe('object initializer shorthand:', function () {
  it('object literal initializer shorthand',
    generateTest('var a = {x, y};',
      'let a = {\n  x,\n  y\n};'));

  it('object pattern initializer shorthand',
    generateTest('var {x, y} = {x: 1, y: 2};',
      'let {\n  x,\n  y\n} = {\n  x: 1,\n  y: 2\n};'));
});

describe('property method assignments:', function () {
  it('property method assignment',
    generateTest('var object = {value: 42, toString() { return this.value; }};',
      'let object = {\n  value: 42,\n\n  toString() {\n    return this.value;\n  }\n\n};'));
});

describe('pattern matching:', function () {
  it('pattern match',
    generateTest('switch [a,b] { case [,5]: {} case [5,,,6]: {}}',
      'let switchStatement0 = [a, b];\n\nif (switchStatement0.length >= 2 && switchStatement0[1] === 5) {} else if (switchStatement0.length >= 4 && switchStatement0[0] === 5 && switchStatement0[3] === 6) {}'));
});

describe('delete statement:', function () {
  it('delete statement',
    generateTest('delete x;', 'delete x;'));
});

describe('do-while loop:', function () {
  it('do-while loop',
    generateTest('do { f(); } while true;', 'do {\n  f();\n} while (true);'));
});

describe('channels:', function () {
  it('get expression',
    generateTest('f(<-x);',
      'f(await x.get());'));

  it('push statement',
    generateTest('a <- b;',
      'a.push(b);'));

  it('go statement',
    generateTest('go { f(); };',
      '(async function () {\n  f();\n})();'));

  it('get operator in global context',
    generateErrorTest('::f(<-::x);',
      [{ type: "GetExpressionRequiresAsync" }]));

  it('get operator in a normal function',
    generateErrorTest('fn h() { ::f(<-::x); }',
      [{ type: "GetExpressionRequiresAsync" }]));

  it('get operator in an async function',
    generateErrorTest('async fn h() { ::f(<-::x); }', []));

  it('get operator in an go statement',
    generateErrorTest('go { ::f(<-::x); };', []));
});

describe('undefined literals:', function () {
  it('undefined literal',
    generateTest('undefined;', 'void 0;'));
});

describe('class declarations', function() {
  it('empty class',
    generateTest('class a {}', 'class a {}'));

  it('empty class with EOS semicolon',
    generateTest('class a {};', 'class a {}'));

  it('empty class with identifier inheritance',
    generateTest('class a extends b {}', 'class a extends b {}'));

  it('empty class with number inheritance',
    generateTest('class a extends 0 {}', 'class a extends 0 {}'));

  it('empty class with string inheritance',
    generateTest('class a extends "string" {}', 'class a extends "string" {}'));

  it('empty class with null inheritance',
    generateTest('class a extends null {}', 'class a extends null {}'));

  it('empty class with undefined inheritance',
    generateTest('class a extends undefined {}', 'class a extends void 0 {}'));

  it('empty class with function call inheritance',
    generateTest('class a extends b() {}', 'class a extends b() {}'));

  it('class with 1 property',
    generateTest('class a { b = 1; }', 'class a {\n  b = 1;\n}'));

  it('class with 2 properties',
    generateTest('class a { b = 1; c = 2; }', 'class a {\n  b = 1;\n  c = 2;\n}'));

  it('class with 3 properties',
    generateTest('class a { b = 1; c = 2; d = 3; }', 'class a {\n  b = 1;\n  c = 2;\n  d = 3;\n}'));

  it('class with 1 property and identifier inheritance',
    generateTest('class a extends b { c = 1; }', 'class a extends b {\n  c = 1;\n}'));

  it('class with 1 static property',
    generateTest('class a { static b = 1; }', 'class a {\n  static b = 1;\n}'));

  it('class with 1 method',
    generateTest('class a { b() {} }', 'class a {\n  b() {}\n\n}'));

  it('class with 2 methods',
    generateTest('class a { b() {} c() {} }', 'class a {\n  b() {}\n\n  c() {}\n\n}'));

  it('class with 3 methods',
    generateTest('class a { b() {} c() {} d() {} }', 'class a {\n  b() {}\n\n  c() {}\n\n  d() {}\n\n}'));

  it('class with 1 static method',
    generateTest('class a { static b() {} }', 'class a {\n  static b() {}\n\n}'));

  it('class with 1 property and 1 method',
    generateTest('class a { b = 1; c() {}}', 'class a {\n  b = 1;\n\n  c() {}\n\n}'));

  it('class with 2 properties, 2 methods, 1 static method, 1 static property, and identifier inheritance',
    generateTest('class a extends b { static c = 1; static d() {} e = 0; f = 1; g() {} h() {} }', 'class a extends b {\n  static c = 1;\n\n  static d() {}\n\n  e = 0;\n  f = 1;\n\n  g() {}\n\n  h() {}\n\n}'));
});

describe('class expressions', function() {
  it('empty class',
    generateTest('var b = class a {};', 'let b = class a {};'));

  it('empty class with identifier inheritance',
    generateTest('var c = class a extends b {};', 'let c = class a extends b {};'));

  it('empty class with number inheritance',
    generateTest('var b = class a extends 0 {};', 'let b = class a extends 0 {};'));

  it('empty class with string inheritance',
    generateTest('var b = class a extends "string" {};', 'let b = class a extends "string" {};'));

  it('empty class with null inheritance',
    generateTest('var b = class a extends null {};', 'let b = class a extends null {};'));

  it('empty class with undefined inheritance',
    generateTest('var b = class a extends undefined {};', 'let b = class a extends void 0 {};'));

  it('empty class with function call inheritance',
    generateTest('var c = class a extends b() {};', 'let c = class a extends b() {};'));

  it('class with 1 property',
    generateTest('var c = class a { b = 1; };', 'let c = class a {\n  b = 1;\n};'));

  it('class with 2 properties',
    generateTest('var d = class a { b = 1; c = 2; };', 'let d = class a {\n  b = 1;\n  c = 2;\n};'));

  it('class with 3 properties',
    generateTest('var e = class a { b = 1; c = 2; d = 3; };', 'let e = class a {\n  b = 1;\n  c = 2;\n  d = 3;\n};'));

  it('class with 1 property and identifier inheritance',
    generateTest('var d = class a extends b { c = 1; };', 'let d = class a extends b {\n  c = 1;\n};'));

  it('class with 1 static property',
    generateTest('var c = class a { static b = 1; };', 'let c = class a {\n  static b = 1;\n};'));

  it('class with 1 method',
    generateTest('var c = class a { b() {} };', 'let c = class a {\n  b() {}\n\n};'));

  it('class with 2 methods',
    generateTest('var d = class a { b() {} c() {} };', 'let d = class a {\n  b() {}\n\n  c() {}\n\n};'));

  it('class with 3 methods',
    generateTest('var e = class a { b() {} c() {} d() {} };', 'let e = class a {\n  b() {}\n\n  c() {}\n\n  d() {}\n\n};'));

  it('class with 1 static method',
    generateTest('var c = class a { static b() {} };', 'let c = class a {\n  static b() {}\n\n};'));

  it('class with 1 property and 1 method',
    generateTest('var d = class a { b = 1; c() {}};', 'let d = class a {\n  b = 1;\n\n  c() {}\n\n};'));

  it('class with 2 properties, 2 methods, 1 static method, 1 static property, and identifier inheritance',
    generateTest('var i = class a extends b { static c = 1; static d() {} e = 0; f = 1; g() {} h() {} };', 'let i = class a extends b {\n  static c = 1;\n\n  static d() {}\n\n  e = 0;\n  f = 1;\n\n  g() {}\n\n  h() {}\n\n};'));
});
