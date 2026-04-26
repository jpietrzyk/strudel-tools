const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

const sharedConfig = {
	bundle: true,
	sourcemap: !production,
	sourcesContent: false,
	logLevel: 'silent',
	plugins: [esbuildProblemMatcherPlugin],
};

async function main() {
	const extensionCtx = await esbuild.context({
		...sharedConfig,
		entryPoints: ['src/extension.ts'],
		format: 'cjs',
		minify: production,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
	});

	const webviewCtx = await esbuild.context({
		...sharedConfig,
		entryPoints: ['src/webview/main.ts'],
		format: 'iife',
		minify: production,
		platform: 'browser',
		target: ['es2021'],
		outfile: 'dist/webview.js',
	});

	if (watch) {
		await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
	} else {
		await Promise.all([extensionCtx.rebuild(), webviewCtx.rebuild()]);
		await Promise.all([extensionCtx.dispose(), webviewCtx.dispose()]);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
