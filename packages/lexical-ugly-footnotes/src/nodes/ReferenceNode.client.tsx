import type { EditorConfig, LexicalEditor } from "lexical";
import type React from "react";
import { FootnoteReferenceNode as FootnoteReferenceNodeServer } from "./ReferenceNode.server.js";
import FootnoteReferenceComponent from "../components/ReferenceComponent.js";
import type { ComponentType } from "react";
import type { ReferenceComponentProps } from "../types/reference.js";
import { getReferenceClasses } from "../theme/index.js";

export class FootnoteReferenceNode extends FootnoteReferenceNodeServer {
	component(): ComponentType<ReferenceComponentProps> | null {
		return FootnoteReferenceComponent;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;

		const referenceId = this.getReferenceId();
		const order = this.getOrder();
		const classes = getReferenceClasses(config);

		return (
			<Component
				referenceId={referenceId}
				nodeKey={this.getKey()}
				order={order}
				classNames={classes}
			/>
		);
	}
}

// Re-export everything from server
export {
	type SerializedFootnoteReferenceNode,
	registerReferenceNodeClass,
	$createFootnoteReferenceNode,
	$isFootnoteReferenceNode,
} from "./ReferenceNode.server.js";

