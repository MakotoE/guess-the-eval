module.exports = {
    rules: {
        'react/function-component-definition': 'off',
        '@typescript-eslint/no-unsafe-call': 'off', // Causes false positives
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                'checksVoidReturn': false,
            },
        ],
    },
}
