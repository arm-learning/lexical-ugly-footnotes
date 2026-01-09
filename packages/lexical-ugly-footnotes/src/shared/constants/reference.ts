import { LUF_PREFIX } from "./prefix.js";

export const REFERENCE_TYPE = `${LUF_PREFIX}-reference`;

export const REFERENCE_ATTR = {
  container: `data-${REFERENCE_TYPE}-container`,
  referenceId: `data-${REFERENCE_TYPE}-reference-id`,
  order: `data-${REFERENCE_TYPE}-order`,
} as const;

export const REFERENCE_CLASS = {
  container: `${LUF_PREFIX}-reference`,
  sup: `${LUF_PREFIX}-reference-sup`,
  active: `${LUF_PREFIX}-reference-sup--active`,
  focus: `${LUF_PREFIX}-reference-sup--focus`,
} as const;
