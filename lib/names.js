export const SITE_NAME = "Kids Play Portal";
export const PROJECT_NAME = "Kids Play Portal";

export const BACK_TO_SITE_LABEL = "Back to all apps";

export function pageTitle(title) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}
