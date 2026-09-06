// customTemplate for typescript-plugin-css-modules (see tsconfig.json).
//
// The plugin's generated declaration types the default export as a plain
// object literal appended after the CSS source lines, so go-to-definition on
// `styles.foo` lands at the end of the CSS file. Named exports, by contrast,
// are emitted on the line where the class is defined. Rewriting the default
// export as a namespace that re-exports those named declarations makes
// TypeScript resolve `styles.foo` through the alias to the correct line.
// Classnames that aren't valid identifiers can't be named exports; they keep
// their string type via an intersection with a plain object type.

const VALID_NAME = /^[A-Za-z_$][\w$]*$/;

module.exports = (dts, { classes }) => {
  const marker = dts.indexOf('declare let _classes:');
  if (marker === -1) return dts;

  const head = dts.slice(0, marker);
  const named = [];
  const plain = [];
  for (const name of Object.keys(classes)) {
    if (VALID_NAME.test(name) && head.includes(`export let ${name}:`)) {
      named.push(name);
    } else {
      plain.push(name);
    }
  }
  if (named.length === 0) return dts;

  let out = head;
  out += `declare namespace _classes {\n  export { ${named.join(', ')} };\n}\n`;
  if (plain.length > 0) {
    out += `declare let _extra: {\n${plain
      .map((name) => `  '${name}': string;`)
      .join('\n')}\n};\n`;
    out += 'declare const _styles: typeof _classes & typeof _extra;\n';
    out += 'export default _styles;\n';
  } else {
    out += 'export default _classes;\n';
  }
  return out;
};
