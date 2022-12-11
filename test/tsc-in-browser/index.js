window.onload = async () => {

  let log = console.log.bind(console);

  function isURL(src) {
    return src.startsWith('http');
  }

  function insertScript(scriptSrc, type) {
    return new Promise((resolve) => {
      let el = document.createElement('script');
      el.src = scriptSrc;
      if (type) el.type = type;
      document.body.append(el);

      el.addEventListener('load', (ev) => {
        console.log(`Loaded: ${scriptSrc}`, ev);
        resolve();
      });
    });
  }

  function installNpmPackage(packageSrcOrName, type) {
    return isURL(packageSrcOrName) ? insertScript(packageSrcOrName, type) : insertScript(`https://cdn.jsdelivr.net/npm/${packageSrcOrName}`, type);
  }

  // -----------------------------------------
  // -----------------------------------------
  // -----------------------------------------

  async function installTSCompiler() {
    const typescriptServices = 'https://cdn.jsdelivr.net/npm/typescript@4.6.3/lib/typescriptServices.js';
    return installNpmPackage(typescriptServices).then(() => {
      const ts = window.ts;

      if (!ts) {
        return null;
      }
      window.tsc = ts;

      log(`ts@${ts.version} installed in your console.`);
      return ts;
    });
  }

  // Promise.all([
  //   installNpmPackage('tslib'),
  //   installTSCompiler()
  // ])
  //   .then(() => {
  //     const tsc = window.ts;
  //
  //     let result = window.x = tsc.transpileModule(sourceCode, {
  //       compilerOptions: {
  //         target: 'esnext',
  //         module: 'es3',
  //         strict: true,
  //         jsx: 'preserve',
  //         importHelpers: true,
  //         moduleResolution: 'node',
  //         experimentalDecorators: true,
  //         skipLibCheck: true,
  //         esModuleInterop: true,
  //         allowSyntheticDefaultImports: true,
  //         sourceMap: false,
  //       }
  //     });
  //     console.log('编译结果：', result);
  //
  //     let el = document.createElement('script');
  //     el.innerText = result.outputText.replaceAll('import { __decorate } from "tslib"', '');
  //     el.type = 'module';
  //     document.body.append(el);
  //   });

  installNpmPackage('tslib')
    .then(() => {
      let el = document.createElement('script');
      el.type = 'module';
      el.text = `
export const {
 __extends,
 __assign,
 __rest,
 __decorate,
 __param,
 __metadata,
 __awaiter,
 __generator,
 __exportStar,
 __values,
 __read,
 __spread,
 __spreadArrays,
 __spreadArray,
 __await,
 __asyncGenerator,
 __asyncDelegator,
 __asyncValues,
 __makeTemplateObject,
 __importStar,
 __importDefault,
 __classPrivateFieldGet,
 __classPrivateFieldSet,
 __classPrivateFieldIn,
 __createBinding
} = window;
`;
      document.body.append(el);
    });
  await installTSCompiler();
};

/**
 * @param code {string}
 */
const compile = async (code) => {
  return window.tsc.transpileModule(code, {
    compilerOptions: {
      target: 'esnext',
      module: 'es3',
      strict: true,
      jsx: 'preserve',
      importHelpers: true,
      moduleResolution: 'node',
      experimentalDecorators: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      sourceMap: false,
    }
  });
};
