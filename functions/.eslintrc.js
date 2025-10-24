// functions/.eslintrc.js
module.exports = {
  root: true,
  env: { node: true, es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: "script" },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": ["warn", { args: "none" }],
  },
  // extra safety: declare CJS globals so no-undef never trips
  globals: {
    module: "readonly",
    require: "readonly",
    exports: "readonly",
    process: "readonly",
  },
};
