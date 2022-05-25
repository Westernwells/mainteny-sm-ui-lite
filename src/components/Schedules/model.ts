interface ScheduledItemNestedGroup {
  [key: string]: string[];
}
export interface ScheduledItemGroup {
  [key: string]: ScheduledItemNestedGroup;
}
