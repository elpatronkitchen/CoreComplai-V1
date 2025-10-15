module.exports = { 
  parser: "@typescript-eslint/parser", 
  extends: [
    "eslint:recommended", 
    "plugin:react-hooks/recommended", 
    "prettier"
  ], 
  ignorePatterns: ["dist", "storybook-static"], 
  rules: {} 
};
