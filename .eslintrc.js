module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'react',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    env: {
        browser: true,
        node: true,
    },
    ecmaFeatures: {
        jsx: true,
    },
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: ["*.js"],
    rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'quotes': 'off',
        '@typescript-eslint/quotes': ['error', 'single'],
        'indent': 'off',
        '@typescript-eslint/indent': ['error', 'tab'],
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    },
};
