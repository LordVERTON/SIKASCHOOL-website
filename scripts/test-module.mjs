import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');

export function loadModule(path, mocks = {}, globals = {}) {
  const output = ts.transpileModule(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, require: name => name in mocks ? mocks[name] : require(name),
    process: { env: {} }, console, Request, Response, AbortSignal, ...globals,
  });
  return exports;
}
