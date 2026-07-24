export default [
  {
    files: ["**/*.js"],

    languageOptions: {
      globals: {
        define: "readonly",
      },
    },

    rules: {
      "no-unused-vars": "warn",
      "no-unreachable": "warn",
      "no-redeclare": "warn",
    },
  },
];
