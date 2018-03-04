// so Rollup can find node_modules
import resolve from 'rollup-plugin-node-resolve';
// so Rollup can convert CommonJS modules into ES modules
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/logDiff.js',
		output: {
			name: 'logDiff',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs()
		]
	},
	// CommonJS (cjs) and ES module (es) build.
	{
		input: 'src/logDiff.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			resolve(),
			commonjs()
		]
	}
];
