import { useEffect, useMemo } from "react";
import { useNodeFocus } from "../hooks/useNodeFocus.js";
import { useNodeActive } from "../hooks/useNodeActive.js";
import { useEditorKeyDown } from "../hooks/useEditorKeyDown.js";
import { twMerge } from "tailwind-merge";

type LineBreakProps = {
	nodeKey: string;
};

const LineBreak = ({ nodeKey }: LineBreakProps) => {
	const { isFocus } = useNodeFocus({ nodeKey });
	const { isActive, ref, setActive } = useNodeActive<HTMLDivElement>({});
	const { escapeWithParagraph} =
		useEditorKeyDown({ nodeKey });

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
				className={twMerge("line-break")}
				onClick={() => setActive(true)}
				onKeyDown={() => setActive(true)}
			>
				<div className="w-full h-px bg-foreground" />
			</div>
		</>
	);
};

export default LineBreak;
