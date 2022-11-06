export namespace types {
  export type TypeString =
    'Undefined'
    | 'Null'
    | 'Object'
    | 'Function'
    | 'Array'
    | 'Symbol'
    | 'String'
    | 'Date'
    | 'Number'
    | 'Promise'
    | string;
  export type RecordS<T> = Record<KeyOf<T>, T>;
  export type KeyType = string | number;
  export type KeyOf<T> = keyof T | KeyType;
  export type FalsyLike = false | any;

  /** 数组元素 */
  export type IteratorItem<T, K = KeyType> = {
    /** 元素 */
    item: T,
    /** 数组元素索引 */
    index: K,
  };

  /**
   * 可控数据
   */
  export type Nillable<T> = null | undefined | T;
}
