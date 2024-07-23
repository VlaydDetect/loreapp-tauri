module.exports = {
    root: true, // So parent files don't get applied
    env: {
        es6: true,
        browser: true,
        node: false,
    },
    extends: [
        'plugin:eslint-plugin-import/recommended',
        'plugin:eslint-plugin-import/typescript',
        'eslint-config-airbnb',
        'eslint-config-airbnb-typescript',
        'eslint-config-prettier',
    ],
    plugins: [
        'eslint-plugin-react-hooks',
        '@typescript-eslint/eslint-plugin',
        'eslint-plugin-import',
        'eslint-plugin-react',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 7,
    },
    rules: {
        'max-classes-per-file': 'off', // Just as bad as "max components per file"
        'linebreak-style': 'off', // Неправильно работает в Windows.
        'arrow-parens': 'off', // Несовместимо с prettier
        'object-curly-newline': 'off', // Несовместимо с prettier
        'no-mixed-operators': 'off', // Несовместимо с prettier
        'function-paren-newline': 'off', // Несовместимо с prettier
        'no-plusplus': 'off',
        'space-before-function-paren': 0, // Несовместимо с prettier
        'max-len': ['error', 150, 2, { ignoreUrls: true, ignoreComments: true, ignoreStrings: true }], // airbnb позволяет некоторые пограничные случаи
        'no-underscore-dangle': 'off',

        'no-console': ['error', { allow: ['warn', 'error'] }], // airbnb использует предупреждение
        'no-alert': 'error', // airbnb использует предупреждение

        'prefer-destructuring': 'off',

        'react/no-find-dom-node': 'off', // Я этого не знаю
        'react/no-did-mount-set-state': 'off',
        'react/no-unused-prop-types': 'off', // Это всё ещё работает нестабильно
        'react/jsx-one-expression-per-line': 'off',

        '@typescript-eslint/no-use-before-define': [
            'error',
            {
                functions: false,
                classes: true,
                variables: true,
            },
        ],




        'no-continue': 'off',
        'no-param-reassign': 'off',
        'no-constant-condition': 'error',
        'spaced-comment': ['error', 'always', {
            'line': {
                'markers': ['/', '#region', '#endregion'],
                'exceptions': ['-', '+']
            },
            'block': {
                'markers': ['!', '*',],
                'exceptions': ['*'],
                'balanced': true
            }
        }],
        'func-names': ['error', 'never'],
        'no-extend-native': 'off',
        'no-nested-ternary': 'off',
        'no-lonely-if': 'off',
        'one-var': ['error', {
            'initialized': 'never',
            'uninitialized': 'consecutive'
        }],
        // 'arrow-body-style': ['error', 'as-needed'],
        'arrow-body-style': 'off',
        'object-shorthand': ['error', 'properties'],

        "import/prefer-default-export": "off",
        'import/extensions': 'off',

        'no-unused-expressions': ['error', { 'allowShortCircuit': true, 'allowTernary': true }],
        '@typescript-eslint/no-unused-expressions': ['error', { 'allowShortCircuit': true, 'allowTernary': true }],

        'react/function-component-definition': 'off',
        'class-methods-use-this': ['error', {
            'exceptMethods': [
                // Lexical Nodes Methods
                'updateDOM',
                'createDOM',
                'exportDOM',
                'isShadowRoot',
                'canInsertTextBefore',
                'canInsertTextAfter',
                'isTextEntity',
                'canBeEmpty'
            ]
        }],
        '@typescript-eslint/no-unused-vars': ['error', { "argsIgnorePattern": "^_" }],
        '@typescript-eslint/lines-between-class-members': 'off',
        'no-cond-assign': ['error', 'except-parens'],
        'react/style-prop-object': 'off',



        // disabled type-aware linting due to performance considerations
        '@typescript-eslint/dot-notation': 'off',
        'dot-notation': 'error',
        // disabled type-aware linting due to performance considerations
        '@typescript-eslint/no-implied-eval': 'off',
        'no-implied-eval': 'error',
        // disabled type-aware linting due to performance considerations
        '@typescript-eslint/no-throw-literal': 'off',
        'no-throw-literal': 'error',
        // disabled type-aware linting due to performance considerations
        '@typescript-eslint/return-await': 'off',
        'no-return-await': 'error',

        // Not sure why it doesn't work
        'import/named': 'off',
        'import/no-cycle': 'off',
        // Missing yarn workspace support
        'import/no-extraneous-dependencies': 'off',

        'react-hooks/exhaustive-deps': ['error', { additionalHooks: 'useEnhancedEffect' }],
        'react-hooks/rules-of-hooks': 'error',

        'react/default-props-match-prop-types': [
            'error',
            {
                // Otherwise the rule thinks inner props = outer props
                // But in TypeScript we want to know that a certain prop is defined during render
                // while it can be ommitted from the callsite.
                // Then defaultProps (or default values) will make sure that the prop is defined during render
                allowRequiredDefaults: true,
            },
        ],
        // Can add verbosity to small functions making them harder to grok.
        // Though we have to manually enforce it for function components with default values.
        'react/destructuring-assignment': 'off',
        'react/forbid-prop-types': 'off', // Too strict, no time for that, airbnb использует уведомление об ошибке
        'react/jsx-curly-brace-presence': 'off', // broken
        // Prefer <React.Fragment> over <>.
        'react/jsx-fragments': 'off',
        // Enforces premature optimization
        'react/jsx-no-bind': 'off',
        // We are a UI library.
        'react/jsx-props-no-spreading': 'off',
        // This rule is great for raising people awareness of what a key is and how it works.
        'react/no-array-index-key': 'off',
        'react/no-danger': 'error',
        'react/no-direct-mutation-state': 'error',
        // Not always relevant
        'react/require-default-props': 'off', // airbnb использует уведомление об ошибке
        'react/sort-prop-types': 'error',
        // This depends entirely on what you're doing. There's no universal pattern
        'react/state-in-constructor': 'off',
        // stylistic opinion. For conditional assignment we want it outside, otherwise as static
        'react/static-property-placement': 'off',
        // noopener is enough, no IE 11 support
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md#rule-options
        'react/jsx-no-target-blank': ['error', { allowReferrer: true }],
    },
}