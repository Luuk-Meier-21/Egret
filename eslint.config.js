import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'
import { fixupConfigRules } from '@eslint/compat'

export default [
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.jsx'],
		languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
		rules: {
			'@typescript-eslint/no-use-before-define': ['error'],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
	...fixupConfigRules(pluginReactConfig),
]
