import { parse } from 'acorn';

type AstNode = Record<string, unknown>;

interface StrudelRepl {
	setPattern(pattern: unknown, autostart: boolean): Promise<void>;
	stop(): void;
	start(): void;
}

declare function acquireVsCodeApi(): {
	postMessage(msg: unknown): void;
	getState(): unknown;
	setState(state: unknown): void;
};

const vscode = acquireVsCodeApi();

let repl: StrudelRepl | null = null;
let connected = false;
let initialized = false;

const statusEl = document.getElementById('status');
const connectBtn = document.getElementById('connect') as HTMLButtonElement | null;

function setStatus(text: string) {
	if (statusEl) {
		statusEl.textContent = text;
	}
}

function log(msg: string) {
	console.log('[strudel-webview]', msg);
	vscode.postMessage({ type: 'log', value: msg });
}

function lookupIdentifier(name: string): unknown {
	const g = globalThis as Record<string, unknown>;
	if (name in g && g[name] !== undefined) {
		return g[name];
	}
	throw new Error(`Unknown identifier: ${name}`);
}

function evalNode(node: AstNode): unknown {
	switch (node.type) {
		case 'Program': {
			const body = node.body as AstNode[];
			let result: unknown;
			for (const stmt of body) {
				result = evalNode(stmt);
			}
			return result;
		}
		case 'ExpressionStatement':
			return evalNode(node.expression as AstNode);
		case 'ReturnStatement':
			return node.argument ? evalNode(node.argument as AstNode) : undefined;
		case 'Literal':
			return node.value;
		case 'Identifier':
			return lookupIdentifier(node.name as string);
		case 'CallExpression': {
			const callee = evalNode(node.callee as AstNode);
			const args = (node.arguments as AstNode[]).map((a) => evalNode(a));
			if (typeof callee !== 'function') {
				throw new Error(`Not a function: ${String(callee)}`);
			}
			return callee(...args);
		}
		case 'MemberExpression': {
			const obj = evalNode(node.object as AstNode);
			const prop = node.computed
				? evalNode(node.property as AstNode)
				: (node.property as AstNode).name as string;
			if (obj === null || obj === undefined) {
				throw new Error(`Cannot access property "${String(prop)}" of ${String(obj)}`);
			}
			const val = (obj as Record<string, unknown>)[prop as string];
			if (val === undefined) {
				throw new Error(`Property "${String(prop)}" not found on ${typeof obj}`);
			}
			return val;
		}
		case 'BinaryExpression': {
			const left = evalNode(node.left as AstNode);
			const right = evalNode(node.right as AstNode);
			switch (node.operator as string) {
				case '+': return (left as number) + (right as number);
				case '-': return (left as number) - (right as number);
				case '*': return (left as number) * (right as number);
				case '/': return (left as number) / (right as number);
				case '%': return (left as number) % (right as number);
				case '<': return (left as number) < (right as number);
				case '>': return (left as number) > (right as number);
				case '<=': return (left as number) <= (right as number);
				case '>=': return (left as number) >= (right as number);
				case '==': return left === right;
				case '===': return left === right;
				case '!=': return left !== right;
				case '!==': return left !== right;
				default:
					throw new Error(`Unsupported binary operator: ${node.operator as string}`);
			}
		}
		case 'UnaryExpression': {
			const arg = evalNode(node.argument as AstNode);
			switch (node.operator as string) {
				case '-': return -(arg as number);
				case '+': return +(arg as number);
				case '!': return !arg;
				default:
					throw new Error(`Unsupported unary operator: ${node.operator as string}`);
			}
		}
		case 'ArrayExpression':
			return (node.elements as AstNode[]).map((e) => e ? evalNode(e) : undefined);
		case 'ObjectExpression': {
			const obj: Record<string, unknown> = {};
			for (const prop of node.properties as AstNode[]) {
				const key = prop.computed
					? evalNode(prop.key as AstNode)
					: (prop.key as AstNode).name ?? (prop.key as AstNode).value;
				obj[key as string] = evalNode(prop.value as AstNode);
			}
			return obj;
		}
		case 'ChainExpression':
			return evalNode(node.expression as AstNode);
		case 'SequenceExpression': {
			let result: unknown;
			for (const expr of node.expressions as AstNode[]) {
				result = evalNode(expr);
			}
			return result;
		}
		case 'ParenthesizedExpression':
			return evalNode(node.expression as AstNode);
		default:
			throw new Error(`Unsupported AST node type: ${node.type as string}`);
	}
}

async function init() {
	if (initialized) { return; }
	const strudel = await import('@strudel/web');

	strudel.initAudioOnFirstClick({});
	strudel.miniAllStrings();

	log('Creating webaudioRepl (no transpiler)...');
	repl = strudel.webaudioRepl() as StrudelRepl;

	log('Loading modules into globalThis...');
	await strudel.evalScope(strudel.evalScope, strudel);

	log('Registering synth sounds...');
	await strudel.registerSynthSounds();

	log('Loading samples...');
	await strudel.samples('github:tidalcycles/dirt-samples');

	initialized = true;
	const g = globalThis as Record<string, unknown>;
	log('init complete. Globals: note=' + typeof g.note + ', s=' + typeof g.s + ', m=' + typeof g.m);
	vscode.postMessage({ type: 'ready' });
}

async function connect() {
	if (connected) { return; }
	try {
		setStatus('Initializing...');
		log('Connect button clicked');

		await init();
		connected = true;
		setStatus('Connected');
		log('Connected successfully');
		if (connectBtn) {
			connectBtn.textContent = 'Connected';
			connectBtn.disabled = true;
		}
		vscode.postMessage({ type: 'status', value: 'connected' });
	} catch (e) {
		setStatus('Connection failed: ' + String(e));
		log('Connection error: ' + String(e));
		vscode.postMessage({ type: 'error', value: String(e) });
	}
}

async function safeEval(code: string): Promise<unknown> {
	const { transpiler } = await import('@strudel/web');
	const transpiled = transpiler(code);
	const jsCode = transpiled.output;
	log('Transpiled: ' + jsCode.substring(0, 200));

	const ast = parse(jsCode, {
		ecmaVersion: 2022,
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true,
		sourceType: 'script',
	}) as unknown as AstNode;

	return evalNode(ast);
}

async function play(code: string) {
	log('play() called with code: ' + code.substring(0, 80));
	if (!connected) { await connect(); }
	try {
		setStatus('Playing...');
		log('Running safe evaluator...');
		const pattern = await safeEval(code);
		log('Eval result type: ' + typeof pattern);

		if (!repl) {
			throw new Error('Repl not initialized');
		}

		await repl.setPattern(pattern, true);
		log('setPattern resolved');
		setStatus('Playing');
		vscode.postMessage({ type: 'status', value: 'playing' });
	} catch (e) {
		setStatus('Error: ' + String(e));
		log('play error: ' + String(e));
		vscode.postMessage({ type: 'error', value: String(e) });
	}
}

function stop() {
	log('stop() called');
	if (repl) {
		repl.stop();
	}
	setStatus('Stopped');
	vscode.postMessage({ type: 'status', value: 'stopped' });
}

connectBtn?.addEventListener('click', connect);

window.addEventListener('message', (event: MessageEvent) => {
	const message = event.data as { command: string; code?: string };
	log('Received message: ' + message.command);
	switch (message.command) {
		case 'evaluate':
			if (message.code) { play(message.code); }
			break;
		case 'stop':
			stop();
			break;
	}
});

log('Webview script loaded');
