$traceurRuntime.ModuleStore.getAnonymousModule(function() {
  "use strict";
  var Node = module.require("../Node").Node,
      traceur = require("traceur");
  function JavascriptLiteralExpression(raw) {
    Node.call(this);
    this.type = "JavascriptExpression";
    this["JavascriptLiteralExpression"] = raw;
  }
  JavascriptLiteralExpression.prototype = Object.create(Node);
  JavascriptLiteralExpression.prototype.codegen = function() {
    if (!Node.prototype.codegen.call(this)) {
      return;
    }
    return this;
  };
  JavascriptLiteralExpression.prototype.hasCallExpression = function() {
    return false;
  };
  exports.JavascriptLiteralExpression = JavascriptLiteralExpression;
  return {};
});

//# sourceMappingURL=JavascriptLiteralExpression.map
