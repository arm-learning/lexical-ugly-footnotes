import { LUF_PREFIX } from "./prefix.js";

export const LINE_BREAK_TYPE = `${LUF_PREFIX}-linebreak`;

export const LINE_BREAK_ATTR = {
  container: `data-${LINE_BREAK_TYPE}-container`,
} as const;

export const LINE_BREAK_CLASS = {
  container: `${LUF_PREFIX}-linebreak-container`,
  base: `${LUF_PREFIX}-linebreak`,
  active: `${LUF_PREFIX}-linebreak--active`,
} as const;
