# Lexical Ugly Footnotes - **Experimental**

## Goals

- This is a simple plugin for lexical.js
- It allows adding a naive implementation of footnotes to the editor
- Additional features:
  - Allows for 1 level of nesting when using nested editors
  - Allows for customization through a variety of styling solutions / overrides (see demo folder)
  - Allows for rendering to html & comes with sensible defaults

### Current Use Case:

- There are still some leftover bugs in the state management that means this is not a good plugin for consumer usage
- Works great for editors where the user is aware of limitations with the plugin and doens't want to roll their own

### Install:

```bash
pnpm i lexical-ugly-footnotes
```

### Usage:

1. Add the FootnotePlugin to the editor:

```tsx
<LexicalComposer initialConfig={initialConfig}>
  <SharedHistoryContext>
    <FootnoteButton />
    <div className="relative border rounded-md p-4 min-h-[200px]">
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="outline-none min-h-[150px]" />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <EditorRefPlugin editorRef={editorRef} />
      <FootnotePlugin /> {/* <-- */}
      <HistoryPlugin />
    </div>
  </SharedHistoryContext>
</LexicalComposer>
```

2. If using nested Editors, add the NestedFootnotePlugin to the editor:
   - See `packages/ui/src/components/NestedFootnoteDemoComponent.tsx` for the nested editor implementation
   - See `packages/ui/src/editor-showcase-nested.tsx` for the main editor that uses nested editors

3. Add a method to dispatch the insert footnote command:

```tsx
import { INSERT_FOOTNOTE_BLOCK_COMMAND } from "lexical-ugly-footnotes/client";

const FootnoteButton = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <button 
      onClick={() => editor.dispatchCommand(INSERT_FOOTNOTE_BLOCK_COMMAND, undefined)}
    >
      Insert Footnote
    </button>
  );
}
```

### Inspiration:

- [lexical-beautiful-mentions](https://github.com/sodenn/lexical-beautiful-mentions)
  - The purpose of this library started as a way to understand how to override nodes by learning how it was achieved in beautiful-mentions -- what an amazing architecture & API!

### TODOS

- [ ] chore: cleanup layout of tabs
- [ ] chore: cleanup UI in general
- [ ] chore: replace vite stand in with vite based framework like tanstack start
- [ ] test: increase depth of playwright tests
- [ ] minor enhancement: add ability to handle multiple decorators
- [ ] major: add shared history
- [ ] major: move away from modules
- [ ] major: move away from storing state in html and use lexical state apis
- [ ] minor: move away from uuidv7 and use a more space efficient id
- [ ] bug: deletion of nodes may be extremely buggy
- [ ] bug: history is extremely buggy

- [ ] fix dependencies
  - [x] rename variables
  - [x] rerun tests
  - [x] circular import check
  - [x] fix deletion bug
  - [x] manually go through each test
    - [x] test tests serially
  - [x] update readme to experimental
  - [x] update todos to include moving away from modules
  - [x] update readme to document moving to state apis / move away from uuids
  - [ ] fix duplicate build
  - [ ] run lint
  - [ ] clean core
  - [ ] retest output of dependencies package.json
  - [ ] test changeset ignore list
  - [ ] test size of package