import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: { globals: globals.browser },
  },
  {
    plugins: {
      react: pluginReact,
    },
    rules: {
      "react/prop-types": "off", // 例: prop-typesルールをオフにする
      "no-unused-vars": "off", // 未使用変数の警告を無効にする
      "no-undef": "warn", // 未定義の変数の警告を表示
    }
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];