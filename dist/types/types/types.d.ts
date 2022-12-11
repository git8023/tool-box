export declare namespace types {
    /**
     * 基本数据类型字符串值
     */
    type TypeString = 'Undefined' | 'Null' | 'Object' | 'Function' | 'Array' | 'Symbol' | 'String' | 'Date' | 'Number' | 'Promise' | string;
    /**
     * 数据分组
     *
     * @example
     * {[P in types.KeyType | keyof T]:T}
     */
    type RecordS<T> = Record<KeyOf<T>, T>;
    /**
     * 数据分组
     * @example
     *
     * type ObjectValidator = types.RecordST<T, fns.ObjectIteratorHandler<T>>
     */
    type RecordST<T, V> = Record<keyof T, V>;
    /**
     * 可选的数据分组
     */
    type RecordSTP<T, V> = Partial<types.RecordST<T, V>>;
    /**
     * 可用于对象属性类型
     */
    type KeyType = string | number;
    /**
     * 类型中定义的属性
     */
    type KeyOfOnly<T> = keyof T;
    /**
     * 类型中定义的属性或者所有可用于对象属性的类型
     */
    type KeyOf<T> = KeyOfOnly<T> | KeyType;
    /**
     * boolean|void
     */
    type FalsyLike = boolean | void;
    /** 数组元素 */
    type IteratorItem<T, K = KeyType> = {
        /** 元素 */
        item: T;
        /** 数组元素索引 */
        index: K;
    };
    /**
     * 数组迭代元素
     */
    type ArrayIteratorItem<T> = IteratorItem<T, number>;
    /**
     * 可控数据
     */
    type Nillable<T> = void | null | undefined | T;
    /**
     * Promise控制增强类
     */
    interface PromiseControl<T> extends Promise<T> {
        /**
         * 终止
         */
        abort(): void;
    }
    type DecoratorClassParameter<T = any> = {
        target: T;
    };
    /**
     * 函数装饰器参数
     */
    type DecoratorMethodParameter<T = any> = {
        target: T;
        fnKey: string;
    };
    type DecoratorPropParameter<T = any> = DecoratorMethodParameter<T> & {
        desc: PropertyDescriptor;
    };
}
/**
 * Vuex类型依赖
 */
export declare namespace vuex {
    type ActionContext<S, R = any> = {
        state: S;
        rootState: R;
        commit(type: string, ...args: any[]): void;
    };
    type MutationTree<T> = types.RecordS<(state: T, payload?: any) => any>;
    type ActionTree<T, R = any> = types.RecordS<(ctx: ActionContext<T, R>, payload?: any) => void>;
    type GetterTree<S, R> = types.RecordS<(state: S, getters: any, rootState: R, rootGetters: any) => any>;
}
