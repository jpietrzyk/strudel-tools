import * as vscode from 'vscode';
import { StrudelView } from './strudelView';

let strudelView: StrudelView;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Strudel');
	context.subscriptions.push(outputChannel);

	strudelView = new StrudelView(context.extensionUri, outputChannel);

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = '$(mute) Strudel';
	statusBarItem.tooltip = 'Strudel: Stopped';
	statusBarItem.show();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(StrudelView.viewType, strudelView, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	);

	context.subscriptions.push(statusBarItem);

	context.subscriptions.push(
		vscode.commands.registerCommand('strudel-tools.play', () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No active editor');
				return;
			}
			const doc = editor.document;
			if (!doc.fileName.endsWith('.strudel')) {
				vscode.window.showWarningMessage('Active file is not a .strudel file');
				return;
			}
			const code = doc.getText();
			if (!code.trim()) {
				vscode.window.showWarningMessage('File is empty');
				return;
			}
			statusBarItem.text = '$(play) Strudel';
			statusBarItem.tooltip = 'Strudel: Playing';
			strudelView.sendCode(code);
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('strudel-tools.stop', () => {
			statusBarItem.text = '$(mute) Strudel';
			statusBarItem.tooltip = 'Strudel: Stopped';
			strudelView.stop();
		}),
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('strudel-tools.evaluate', () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No active editor');
				return;
			}
			const selection = editor.selection;
			const code = selection.isEmpty
				? editor.document.getText()
				: editor.document.getText(selection);
			if (!code.trim()) {
				vscode.window.showWarningMessage('No code to evaluate');
				return;
			}
			statusBarItem.text = '$(play) Strudel';
			statusBarItem.tooltip = 'Strudel: Playing';
			strudelView.sendCode(code);
		}),
	);
}

export function deactivate() {}
