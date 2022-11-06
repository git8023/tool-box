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
  export type KeyOfOnly<T> = keyof T;
  export type KeyOf<T> = KeyOfOnly<T> | KeyType;
  export type FalsyLike = boolean | void;

  /** 数组元素 */
  export type IteratorItem<T, K = KeyType> = {
    /** 元素 */
    item: T,
    /** 数组元素索引 */
    index: K,
  };

  /**
   * 数组迭代元素
   */
  export type ArrayIteratorItem<T> = IteratorItem<T, number>;

  /**
   * 可控数据
   */
  export type Nillable<T> = void | null | undefined | T;
}
