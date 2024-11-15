export type StatusColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'success.darkSuccess'
  | 'primary.mainLight'
  | 'action.active'
  | 'warning'
  | 'warning.dark'
  | 'warning.light'
  | 'info.light';

export enum StatusColorVariants {
  GREEN = 'Green',
  YELLOW = 'Yellow',
  GREY = 'Grey',
  ORANGE = 'Orange',
  RED = 'Red',
  SKYBLUE = 'Sky Blue',
}

export const STATUS_TO_COLOR = new Map<StatusColorVariants, StatusColor>([
  [StatusColorVariants.GREEN, 'success.darkSuccess'],
  [StatusColorVariants.YELLOW, 'warning.light'],
  [StatusColorVariants.GREY, 'info'],
  [StatusColorVariants.ORANGE, 'warning'],
  [StatusColorVariants.RED, 'error'],
  [StatusColorVariants.SKYBLUE, 'primary.mainLight'],
]);

export enum ARCHIVE_ACTION {
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
}

export enum CANCEL_ACTION {
  CANCEL = 'cancel',
  UNCANCEL = 'uncancel',
}
