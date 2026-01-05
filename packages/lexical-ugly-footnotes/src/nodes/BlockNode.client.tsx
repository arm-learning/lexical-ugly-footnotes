import type { EditorConfig, LexicalEditor } from "lexical";
import type React from "react";
import { FootnoteBlockNode as FootnoteBlockNodeServer } from "./BlockNode.server.js";
import FootnoteBlockComponent from "../components/BlockComponent.js";
import type { ComponentType } from "react";
import type { BlockComponentProps } from "../types/block.js";
import { getBlockClasses } from "../theme/index.js";

export class FootnoteBlockNode extends FootnoteBlockNodeServer {
  component(): ComponentType<BlockComponentProps> | null {
    return FootnoteBlockComponent;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
    const Component = this.component();
    if (!Component) return null;
    const referenceId = this.getReferenceId();
    const order = this.getOrder();
    const classes = getBlockClasses(config);
    return (
      <Component
        nodeKey={this.getKey()}
        referenceId={referenceId}
        order={order}
        blockNote={this.__blockNote}
        classNames={classes}
      />
    );
  }
}

// Re-export everything from server
export {
  theme,
  type SerializedBlockNote,
  type SerializedFootnoteBlockNode,
  registerBlockNodeClass,
  $createFootnoteBlockNode,
  $isFootnoteBlockNode,
} from "./BlockNode.server.js";

