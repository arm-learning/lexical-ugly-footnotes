import type { EditorConfig, LexicalEditor } from "lexical";
import type React from "react";
import { FootnoteLineBreakNode as FootnoteLineBreakNodeServer } from "./LineBreakNode.server.js";
import LineBreak from "../components/LineBreakComponent.js";
import type { ComponentType } from "react";
import type { LineBreakComponentProps } from "../types/line-break.js";
import { getLineBreakClasses } from "../theme/index.js";

export class FootnoteLineBreakNode extends FootnoteLineBreakNodeServer {
	component(): ComponentType<LineBreakComponentProps> | null {
		return LineBreak;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;
		const classes = getLineBreakClasses(config);
		return <Component nodeKey={this.getKey()} classNames={classes} />;
	}
}

// Re-export everything from server
export {
	type FootnoteLineBreakNodeProps,
	type SerializedFootnoteLineBreakNode,
	convertFootnoteLineBreakNode,
	registerLineBreakNodeClass,
	$createFootnoteLineBreakNode,
	$isFootnoteLineBreakNode,
} from "./LineBreakNode.server.js";

