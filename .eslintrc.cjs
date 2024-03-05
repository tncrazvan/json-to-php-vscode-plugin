/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2024,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  globals: {
    Bun: 'readonly',
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'func-names': ['error', 'always'],
    /**
     * Remember to set "eslint.validate": ["javascript", "svelte"] in settings.json.
     */
    // @see https://astexplorer.net/
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ArrowFunctionExpression',
        message: 'Shorthand arrow functions are not allowed.',
      },
      {
        selector: 'ClassDeclaration',
        message: 'Classes are not allowed, use object literals instead.',
      },
      {
        selector: 'ThrowStatement',
        message: 'Throw statements are not allowed, return Unsafe instead.',
      },
    ],
  },
}
