import * as vscode from 'vscode';

export class StrudelView implements vscode.WebviewViewProvider {
	public static readonly viewType = 'strudel-tools.playerView';
	private _view?: vscode.WebviewView;
	private readonly _extensionUri: vscode.Uri;
	private readonly _outputChannel: vscode.OutputChannel;

	constructor(extensionUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
		this._extensionUri = extensionUri;
		this._outputChannel = outputChannel;
	}

	public resolveWebviewView(webviewView: vscode.WebviewView): void {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'dist'),
				vscode.Uri.joinPath(this._extensionUri, 'media'),
			],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage((msg: { type: string; value?: string }) => {
			switch (msg.type) {
				case 'status':
					this._outputChannel.appendLine(`[status] ${msg.value}`);
					break;
				case 'error':
					this._outputChannel.appendLine(`[error] ${msg.value}`);
					vscode.window.showErrorMessage(`Strudel: ${msg.value}`);
					break;
				case 'log':
					this._outputChannel.appendLine(`[webview] ${msg.value}`);
					break;
				case 'ready':
					this._outputChannel.appendLine('[webview] ready');
					break;
			}
		});
	}

	public sendCode(code: string): void {
		this._view?.webview.postMessage({ command: 'evaluate', code });
	}

	public stop(): void {
		this._view?.webview.postMessage({ command: 'stop' });
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'),
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'),
		);

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy"
		content="default-src 'none';
			script-src ${webview.cspSource} blob: data:;
			style-src ${webview.cspSource};
			connect-src https: blob:;">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="${styleUri}" rel="stylesheet">
	<title>Strudel Player</title>
</head>
<body>
	<div id="status">Click Connect to start</div>
	<button id="connect">Connect Audio</button>
	<script src="${scriptUri}"></script>
</body>
</html>`;
	}
}
