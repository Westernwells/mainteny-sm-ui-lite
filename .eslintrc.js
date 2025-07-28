module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  globals: {
    JSX: 'readonly',
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks', 'jest'],
  ignorePatterns: ['src/models/*.ts'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-bind': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-fragments': 'off',
    'react/jsx-filename-extension': [1, {extensions: ['.tsx']}],
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-shadow': 'off',
    'consistent-return': 'off',
    'no-param-reassign': 0,
    '@typescript-eslint/no-shadow': ['error'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-console': 'off',
    'react/no-array-index-key': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      2,
      {namedComponents: 'arrow-function'},
    ],
    'import/extensions': 'off',
    'arrow-body-style': 1,
    'no-nested-ternary': 0,
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
    'no-unused-vars': ['error', {varsIgnorePattern: '^_'}],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
}
