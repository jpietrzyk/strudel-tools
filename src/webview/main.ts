import { initStrudel, evaluate, hush, samples } from '@strudel/web';

declare function acquireVsCodeApi(): {
	postMessage(msg: unknown): void;
	getState(): unknown;
	setState(state: unknown): void;
};

const vscode = acquireVsCodeApi();
let connected = false;
let initialized = false;

const statusEl = document.getElementById('status');
const connectBtn = document.getElementById('connect') as HTMLButtonElement | null;

function setStatus(text: string) {
	if (statusEl) {
		statusEl.textContent = text;
	}
}

async function init() {
	if (initialized) { return; }
	await initStrudel({
		prebake: () => samples('github:tidalcycles/dirt-samples'),
	});
	initialized = true;
	vscode.postMessage({ type: 'ready' });
}

async function connect() {
	if (connected) { return; }
	try {
		setStatus('Initializing...');
		await init();
		connected = true;
		setStatus('Connected');
		if (connectBtn) {
			connectBtn.textContent = 'Connected';
			connectBtn.disabled = true;
		}
		vscode.postMessage({ type: 'status', value: 'connected' });
	} catch (e) {
		setStatus('Connection failed');
		vscode.postMessage({ type: 'error', value: String(e) });
	}
}

async function play(code: string) {
	if (!connected) { await connect(); }
	try {
		setStatus('Playing...');
		await evaluate(code);
		setStatus('Playing');
		vscode.postMessage({ type: 'status', value: 'playing' });
	} catch (e) {
		setStatus('Error');
		vscode.postMessage({ type: 'error', value: String(e) });
	}
}

function stop() {
	hush();
	setStatus('Stopped');
	vscode.postMessage({ type: 'status', value: 'stopped' });
}

connectBtn?.addEventListener('click', connect);

window.addEventListener('message', (event: MessageEvent) => {
	const message = event.data as { command: string; code?: string };
	switch (message.command) {
		case 'evaluate':
			if (message.code) { play(message.code); }
			break;
		case 'stop':
			stop();
			break;
	}
});
