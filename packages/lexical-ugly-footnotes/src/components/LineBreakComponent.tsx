import { useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { useEditorKeyDown } from "../hooks/useEditorKeyDown.js";
import { useNodeActive } from "../hooks/useNodeActive.js";
import { useNodeFocus } from "../hooks/useNodeFocus.js";
import type { LineBreakComponentProps } from "../types/line-break.js";

const LineBreak = ({ nodeKey, classNames }: LineBreakComponentProps) => {
  const { isFocus } = useNodeFocus({ nodeKey });
  const { isActive, ref, setActive } = useNodeActive<HTMLDivElement>({});
  const { escapeWithParagraph } = useEditorKeyDown({ nodeKey });

  const isActiveLineBreak = useMemo(() => {
    return isActive || isFocus;
  }, [isActive, isFocus]);

  useEffect(() => {
    if (!isActiveLineBreak) return;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          escapeWithParagraph("up");
          break;
        case "ArrowDown":
          escapeWithParagraph("down");
          break;
        case "ArrowLeft":
          escapeWithParagraph("up");
          break;
        case "ArrowRight":
          escapeWithParagraph("down");
          break;
        // case "Backspace":
        // 	break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isActiveLineBreak, escapeWithParagraph]);
  return (
    <>
      <div
        ref={ref}
        className={twMerge(
          classNames.container,
          isActiveLineBreak && classNames.containerActive,
        )}
        onClick={() => setActive(true)}
        onKeyDown={() => setActive(true)}
        role="separator"
        aria-orientation="horizontal"
      />
    </>
  );
};

export default LineBreak;
