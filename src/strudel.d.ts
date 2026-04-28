declare module '@strudel/web' {
	export function initStrudel(options?: {
		prebake?: () => Promise<void>;
		miniAllStrings?: boolean;
		audioContext?: AudioContext;
	}): Promise<unknown>;
	export function hush(): void;
	export function samples(source: string): Promise<void>;
	export function initAudioOnFirstClick(options?: { disableWorklets?: boolean }): void;
	export function miniAllStrings(): void;
	export function evalScope(...args: unknown[]): Promise<unknown>;
	export function registerSynthSounds(): Promise<void>;
	export function webaudioRepl(options?: Record<string, unknown>): {
		scheduler: unknown;
		setPattern(pat: unknown, autostart: boolean): Promise<void>;
		stop(): void;
		start(): void;
		evaluate(code: string, autoplay?: boolean): Promise<unknown>;
	};
	export function transpiler(code: string, options?: Record<string, unknown>): {
		output: string;
		miniLocations: unknown[];
		widgets: unknown[];
	};
}
