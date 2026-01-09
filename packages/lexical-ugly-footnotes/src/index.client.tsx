// Client node classes (with decorate methods)
export * from "./nodes/BlockNode.client.js";
export * from "./nodes/LineBreakNode.client.js";
export * from "./nodes/ReferenceNode.client.js";

// Base classes and type guards (re-exported from client nodes, but also available directly)
export {
  FootnoteBlockBase,
  $isFootnoteBlockNode,
} from "./shared/nodes/Block.base.js";
export {
  FootnoteLineBreakBase,
  $isFootnoteLineBreakNode,
} from "./shared/nodes/LineBreak.base.js";
export {
  FootnoteReferenceBase,
  $isFootnoteReferenceNode,
} from "./shared/nodes/Reference.base.js";

// Components
export * from "./components/BlockComponent.js";
export * from "./components/LineBreakComponent.js";
export * from "./components/ReferenceComponent.js";
export * from "./components/SharedHistoryState.js";

// Plugins
export * from "./plugins/FootnotePlugin.js";
export * from "./plugins/NestedFootnotePlugin.js";

// Hooks
export * from "./hooks/useEditorKeyDown.js";
export * from "./hooks/useNodeActive.js";
export * from "./hooks/useNodeFocus.js";
export * from "./hooks/useNodeRemove.js";

// Factories (client-only)
export * from "./factories/index.js";

// Re-export server-safe items
export * from "./core/index.js";
export * from "./core/client.js";
export * from "./core/component-utils.js";
export * from "./shared/service.js";
export * from "./types/block.js";
export * from "./types/line-break.js";
export * from "./types/reference.js";
export * from "./shared/constants/block.js";
export * from "./shared/constants/line-break.js";
export * from "./shared/constants/reference.js";
export * from "./shared/constants/prefix.js";
export * from "./shared/constants/commands.js";
export * from "./theme/index.js";
