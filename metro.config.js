const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

/**
 * Web only: resolve `zustand` to its CommonJS build.
 *
 * zustand 5 declares an "import" export condition pointing at esm/index.mjs,
 * which contains `import.meta.env`. Metro emits the web bundle as a classic
 * script, so that throws `SyntaxError: Cannot use 'import.meta' outside a
 * module` at load and the app renders a blank page — which is why the web
 * target was considered unusable here. Native is unaffected: it matches the
 * "react-native" condition, which already points at the CJS build, so this hook
 * is gated on platform and leaves iOS/Android resolution untouched.
 *
 * This exists so the UI can be run and inspected in a browser on a machine with
 * no iOS simulator.
 */
const previousResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && /^zustand(\/|$)/.test(moduleName)) {
    const sub = moduleName === "zustand" ? "index" : moduleName.slice("zustand/".length);
    return {
      type: "sourceFile",
      filePath: path.join(__dirname, "node_modules", "zustand", `${sub}.js`),
    };
  }
  return (previousResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
