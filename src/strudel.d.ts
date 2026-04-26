declare module '@strudel/web' {
	export function initStrudel(options?: { prebake?: () => Promise<void> }): Promise<void>;
	export function evaluate(code: string): Promise<void>;
	export function hush(): void;
	export function samples(source: string): Promise<void>;
}
