import {SELECTABLE_COLORS, TagEntityType, UpdateTagRecord} from 'models/tag';

export const getTagColor = (alreadyTakenColors: string[]) => {
  const availableColors = SELECTABLE_COLORS.filter(
    (color) => !alreadyTakenColors.includes(color),
  );

  if (availableColors.length > 0) {
    return availableColors[0];
  }

  const randomIndex = Math.floor(Math.random() * SELECTABLE_COLORS.length);
  return SELECTABLE_COLORS[randomIndex];
};

export const getAvailableTagColor = (usedColors?: string[]) => {
  if (!usedColors || usedColors.length === 0) {
    return SELECTABLE_COLORS[0];
  }

  return getTagColor(usedColors);
};

export const generateTag = (
  name: string,
  entity: TagEntityType,
  usedColors?: string[],
): UpdateTagRecord => ({
  name,
  entityType: entity,
  color: getAvailableTagColor(usedColors),
});
