import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { useCallback, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useNodeActive } from "../hooks/useNodeActive.js";
import { useNodeFocus } from "../hooks/useNodeFocus.js";
import type { ReferenceComponentProps } from "../types/reference.js";

const FootnoteReferenceComponent = ({
	referenceId = "",
	nodeKey,
	order = 0,
	classNames,
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
			onKeyDown={() => { }}
			tabIndex={0}
			className={twMerge(
				classNames.sup,
				isActive && classNames.supActive,
				isFocus && classNames.supFocused,
			)}
		>
			{order}
		</sup>
	);
};

export default FootnoteReferenceComponent;
