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
    },
};
