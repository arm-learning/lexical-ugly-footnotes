// This file re-exports client-only functions that were moved
// TODO: Consider removing this file and updating imports directly

export {
	$removeFootnoteById,
	$removeFootnoteByBlockNodeKey,
	$removeFootnoteByBlockNodeKeyTwo,
	$removeFootnoteByRefNodeKey,
	$syncFootnotesInParent,
} from "./client.js";
