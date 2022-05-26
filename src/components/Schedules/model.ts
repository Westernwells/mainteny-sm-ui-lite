interface ScheduledItemNestedGroup {
  [key: string]: number;
}
export interface ScheduledItemGroup {
  [key: string]: ScheduledItemNestedGroup;
}
