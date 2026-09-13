export const SITE_NAME = "Whimsical Kids AI Lab";
export const PROJECT_NAME = "Whimsical Kids AI Lab";

export const APP_NAMES = {
  tangoCards: "Tango Cards",
  marbleBattles: "Marble Battles",
  nameQuest: "Name Quest",
};

export const BACK_TO_SITE_LABEL = `Back to ${SITE_NAME}`;

export function pageTitle(title) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}
