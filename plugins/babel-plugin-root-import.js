// http://stackoverflow.com/questions/31068698/importing-node-modules-from-root-directory-using-es6-and-babel-node

module.exports = function (babel) {
  // get the working directory
  var cwd = process.cwd();

  return new babel.Transformer("babel-plugin-root-import", {
    ImportDeclaration: function(node, parent) {
      // probably always true, but let's be safe
      if (!babel.types.isLiteral(node.source)) {
        return node;
      }

      var ref = node.source.value;

      // ensure a value, make sure it's not home relative e.g. ~/foo
      if (!ref || ref[0] !== '/') {
        return node;
      }

      node.source.value = cwd + '/' + node.source.value.slice(1);

      return node;
    }
  });
};
