import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { useCallback, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useNodeActive } from "../hooks/useNodeActive.js";
import { useNodeFocus } from "../hooks/useNodeFocus.js";
import { REFERENCE_CLASS } from "../constants/reference.js";
import type { ReferenceComponentProps } from "../types/reference.js";

const FootnoteReferenceComponent = ({
	referenceId = "",
	nodeKey,
	order = 0,
}: ReferenceComponentProps) => {
	// console.log({ referenceId, nodeKey, order })
	const [editor] = useLexicalComposerContext();
	// const { removeNodeAndReplaceParagraph } = useNodeRemove({ nodeKey });
	const { ref, isActive, setActive } = useNodeActive<HTMLElement>({});
	const { isFocus } = useNodeFocus({ nodeKey });

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (isFocus && (e.key === "Backspace" || e.key === "Delete")) {
				e.preventDefault();
				editor.update(() => {
					const node = $getNodeByKey(nodeKey);
					if (node) {
						node.remove();
						// TODO: FOOTNOTE FIX REMOVAL
					}
				});
			}
		},
		[editor, nodeKey, isFocus],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	return (
		<sup
			ref={ref}
			onClick={() => setActive(true)}
			// onKeyDown={handleKeyDown}
			onKeyDown={() => {}}
			tabIndex={0}
			className={twMerge(
				REFERENCE_CLASS.sup,
				isActive && REFERENCE_CLASS.active,
				isFocus && REFERENCE_CLASS.focus,
			)}
		>
			{order}
		</sup>
	);
};

export default FootnoteReferenceComponent;
