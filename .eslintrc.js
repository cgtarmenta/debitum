module.exports = {
  root: true,
  env: { es2020: true, node: true },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['packages/frontend/**/*.ts', 'packages/frontend/**/*.vue'],
      env: { browser: true },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-essential',
        'prettier',
      ],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint', 'vue'],
    },
    {
      files: ['packages/frontend/**/*.js', 'packages/frontend/**/*.ts'],
      env: { node: true },
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['packages/backend/**/*.js'],
      env: { node: true },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
