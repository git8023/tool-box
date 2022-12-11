export namespace types {
  /**
   * 基本数据类型字符串值
   */
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

  /**
   * 数据分组
   *
   * @example
   * {[P in types.KeyType | keyof T]:T}
   */
  export type RecordS<T> = Record<KeyOf<T>, T>;

  /**
   * 数据分组
   * @example
   *
   * type ObjectValidator = types.RecordST<T, fns.ObjectIteratorHandler<T>>
   */
  export type RecordST<T, V> = Record<keyof T, V>;

  /**
   * 可选的数据分组
   */
  export type RecordSTP<T, V> = Partial<types.RecordST<T, V>>;

  /**
   * 可用于对象属性类型
   */
  export type KeyType = string | number;

  /**
   * 类型中定义的属性
   */
  export type KeyOfOnly<T> = keyof T;

  /**
   * 类型中定义的属性或者所有可用于对象属性的类型
   */
  export type KeyOf<T> = KeyOfOnly<T> | KeyType;

  /**
   * boolean|void
   */
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

  /**
   * Promise控制增强类
   */
  export interface PromiseControl<T> extends Promise<T> {
    /**
     * 终止
     */
    abort(): void;
  }

  export type DecoratorClassParameter<T = any> = {
    target: T
  }

  /**
   * 函数装饰器参数
   */
  export type DecoratorMethodParameter<T = any> = {
    target: T,
    fnKey: string
  }

  export type DecoratorPropParameter<T = any> = DecoratorMethodParameter<T> & {
    desc: PropertyDescriptor
  }
}

/**
 * Vuex类型依赖
 */
export namespace vuex {

  export type ActionContext<S, R = any> = {
    state: S;
    rootState: R;
    commit(
      type: string,
      ...args: any[]
    ): void;
  }

  export type MutationTree<T> = types.RecordS<(
    state: T,
    payload?: any
  ) => any>

  export type ActionTree<T, R = any> = types.RecordS<(
    ctx: ActionContext<T, R>,
    payload?: any
  ) => void>

  export type GetterTree<S, R = any> = types.RecordS<(
    state: S,
    getters: any,
    rootState: R,
    rootGetters: any
  ) => any>;
}
