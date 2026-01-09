import type { EditorConfig } from "lexical";

/**
 * CSS class names for the footnote block node.
 */
export interface BlockCssClassNames {
  /** Container element (grid wrapper) */
  container?: string;
  /** Container when focused/selected */
  containerFocused?: string;
  /** Order number (superscript) container */
  orderContainer?: string;
  /** Order number (superscript) */
  order?: string;
  /** Nested editor element */
  editor?: string;
  /** Nested editor when focused */
  editorFocused?: string;
  /** Static nested editor (for export/preview) */
  editorStatic?: string;
  /** Delete button */
  delete?: string;
}

/**
 * CSS class names for the footnote reference node.
 */
export interface ReferenceCssClassNames {
  /** Container span element */
  container?: string;
  /** Superscript element */
  sup?: string;
  /** Superscript when active (linked block is visible) */
  supActive?: string;
  /** Superscript when focused/selected */
  supFocused?: string;
}

/**
 * CSS class names for the line break node.
 */
export interface LineBreakCssClassNames {
  /** Container element */
  container?: string;
  /** Container when active/selected */
  containerActive?: string;
}

/**
 * Theme configuration for UglyFootnotes.
 *
 * Add this to your Lexical editor's theme config:
 * @example
 *
 */

const editorConfig = {
  theme: {
    uglyFootnotes: {
      block: {
        container: "my-block",
        order: "text-xs text-blue-500",
      },
      reference: {
        sup: "cursor-pointer text-blue-600",
        supFocused: "ring-2 ring-blue-400",
      },
    },
  },
};

export interface UglyFootnotesTheme {
  block?: BlockCssClassNames;
  reference?: ReferenceCssClassNames;
  lineBreak?: LineBreakCssClassNames;
}

// Default class names (fallbacks when theme isn't configured)
export const DEFAULT_BLOCK_CLASSES: Required<BlockCssClassNames> = {
  container: "luf-block",
  containerFocused: "",
  orderContainer: "luf-block-order-container",
  order: "luf-block-order",
  editor: "luf-block-editor",
  editorFocused: "",
  editorStatic: "luf-block-editor-static",
  delete: "luf-block-delete",
};

export const DEFAULT_REFERENCE_CLASSES: Required<ReferenceCssClassNames> = {
  container: "luf-reference",
  sup: "luf-reference-sup",
  supActive: "luf-reference-sup--active",
  supFocused: "luf-reference-sup--focus",
};

export const DEFAULT_LINE_BREAK_CLASSES: Required<LineBreakCssClassNames> = {
  container: "luf-linebreak",
  containerActive: "",
};

/**
 * Extract UglyFootnotes theme from Lexical EditorConfig.
 */
export function getThemeFromConfig(
  config: EditorConfig,
): UglyFootnotesTheme | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (config.theme as { uglyFootnotes?: UglyFootnotesTheme })
    ?.uglyFootnotes;
}

/**
 * Get block classes, merging theme overrides with defaults.
 */
export function getBlockClasses(
  config: EditorConfig,
): Required<BlockCssClassNames> {
  const theme = getThemeFromConfig(config);
  if (!theme?.block) return DEFAULT_BLOCK_CLASSES;

  return {
    ...DEFAULT_BLOCK_CLASSES,
    ...theme.block,
  };
}

/**
 * Get reference classes, merging theme overrides with defaults.
 */
export function getReferenceClasses(
  config: EditorConfig,
): Required<ReferenceCssClassNames> {
  const theme = getThemeFromConfig(config);
  if (!theme?.reference) return DEFAULT_REFERENCE_CLASSES;

  return {
    ...DEFAULT_REFERENCE_CLASSES,
    ...theme.reference,
  };
}

/**
 * Get line break classes, merging theme overrides with defaults.
 */
export function getLineBreakClasses(
  config: EditorConfig,
): Required<LineBreakCssClassNames> {
  const theme = getThemeFromConfig(config);
  if (!theme?.lineBreak) return DEFAULT_LINE_BREAK_CLASSES;

  return {
    ...DEFAULT_LINE_BREAK_CLASSES,
    ...theme.lineBreak,
  };
}
