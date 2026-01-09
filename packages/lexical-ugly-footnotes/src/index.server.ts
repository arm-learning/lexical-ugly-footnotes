// Server node classes
export * from "./nodes/BlockNode.server.js";
export * from "./nodes/LineBreakNode.server.js";
export * from "./nodes/ReferenceNode.server.js";

// Base classes and type guards (re-exported from server nodes, but also available directly)
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

// Core utilities
export * from "./core/index.js";

// Shared service
export * from "./shared/service.js";

// Types
export * from "./types/block.js";
export * from "./types/line-break.js";
export * from "./types/reference.js";

// Constants
export * from "./shared/constants/block.js";
export * from "./shared/constants/line-break.js";
export * from "./shared/constants/reference.js";
export * from "./shared/constants/prefix.js";

// Theme utilities
export * from "./theme/index.js";
