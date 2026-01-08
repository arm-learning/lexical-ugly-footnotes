import { LUF_PREFIX } from "./prefix.js";

export const BLOCK_TYPE = `${LUF_PREFIX}-block`;

export const BLOCK_ATTR = {
	container: `data-${BLOCK_TYPE}-container`,
	order: `data-${BLOCK_TYPE}-order`,
	reference_id: `data-${BLOCK_TYPE}-reference-id`,
};

export const BLOCK_ATTR_NESTED_EDITOR = {
	container: `data-${BLOCK_TYPE}-nested-editor-container`,
	namespace: `${BLOCK_TYPE}-namespace`,
};