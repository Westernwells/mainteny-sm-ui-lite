export type Primitive = string | number | boolean | symbol;
export type NoUnknown = AnyNoObject | AnyRecord;

type AnyNoObject = null | undefined | object | Primitive | NoUnknown[];
type RecordAlias<T> = Record<string | symbol | number, T>;

export type AnyRecord = Record<
  string | symbol | number,
  AnyNoObject | RecordAlias<AnyNoObject | RecordAlias<AnyNoObject>>
>;
export type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};
