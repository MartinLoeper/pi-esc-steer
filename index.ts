/**
 * pi-esc-steer
 *
 * Claude Code-like Escape while the agent is running:
 * abort the current run, then immediately continue with whatever was queued
 * (steer / follow-up), instead of dumping the queue into the editor.
 *
 * Native Pi queues: Esc restores queued text into the editor and aborts. Once the
 * run has settled, the restored text is submitted as the next user turn.
 *
 * Does not own a queue and does not touch the editor component chain (it only
 * listens to raw terminal input), so it cannot stack or fight with extensions
 * that wrap the editor (statusline boxes, navigators, ...).
 */
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { matchesKey } from "@earendil-works/pi-tui";

export default function escSteerExtension(pi: ExtensionAPI) {
	/** After an abort Esc, submit the restored editor text once the run has settled. */
	let continueAfterAbort = false;
	let unsubscribeInput: (() => void) | undefined;

	const tryContinueQueued = (ctx: ExtensionContext): void => {
		if (!continueAfterAbort) return;
		if (!ctx.isIdle()) return;
		continueAfterAbort = false;

		// Defer past settled/finally so the nested prompt is safe.
		setTimeout(() => {
			if (!ctx.isIdle()) return;
			try {
				const text = ctx.ui.getEditorText();
				if (!text.trim()) return;
				ctx.ui.setEditorText("");
				pi.sendUserMessage(text);
			} catch (error) {
				ctx.ui.notify(
					`pi-esc-steer: could not continue after abort: ${error instanceof Error ? error.message : String(error)}`,
					"error",
				);
			}
		}, 0);
	};

	pi.on("session_start", (_event, ctx) => {
		continueAfterAbort = false;
		unsubscribeInput?.();
		unsubscribeInput = undefined;
		if (ctx.mode !== "tui") return;

		unsubscribeInput = ctx.ui.onTerminalInput((data) => {
			// Never consume: Esc must still reach the editor so Pi restores the queue and aborts.
			if (matchesKey(data, "escape") && !ctx.isIdle()) continueAfterAbort = true;
			return undefined;
		});
	});

	pi.on("agent_settled", (_event, ctx) => {
		tryContinueQueued(ctx);
	});

	pi.on("session_shutdown", () => {
		unsubscribeInput?.();
		unsubscribeInput = undefined;
		continueAfterAbort = false;
	});
}
