import { createCommand, type LexicalCommand } from "lexical";

// Commands used by FootnotePlugin
export const INSERT_FOOTNOTE_BLOCK_COMMAND: LexicalCommand<void> =
	createCommand();

export const INSERT_FOOTNOTE_NESTED_COMMAND: LexicalCommand<void> =
	createCommand();

export const RECONCILE_FOOTNOTES_COMMAND: LexicalCommand<void> =
	createCommand();

// Commands used by NestedFootnotePlugin
export const UPDATE_FOOTNOTE_ORDERS_COMMAND: LexicalCommand<void> =
	createCommand();

export const REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND: LexicalCommand<string> =
	createCommand();
