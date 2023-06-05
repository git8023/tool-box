import { VuexDecorator } from 'vuex-class/lib/bindings';
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
    /**
     * 类装饰器参数
     */
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
    /**
     * 函数代理装饰器参数
     */
    type DecoratorProxyMethodParameter = {
        /**目标对象*/
        target: any;
        /**目标函数属性名*/
        key: string;
        /**
         * 属性值或函数, 未绑定到target
         *
         * vof: Value Or Function
         */
        vof: any;
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
    type GetterTree<S, R = any> = types.RecordS<(state: S, getters: any, rootState: R, rootGetters: any) => any>;
    interface ModuleTree<R> {
        [key: string]: Module<any, R>;
    }
    interface Module<S, R> {
        namespaced?: boolean;
        state?: S | (() => S);
        getters?: GetterTree<S, R>;
        actions?: ActionTree<S, R>;
        mutations?: MutationTree<S>;
        modules?: ModuleTree<R>;
    }
    interface ModuleX<S, R> extends Module<S, R> {
        /**命名空间名字*/
        readonly __name__: string;
        /**
         * 重置状态
         */
        __reset__(): void;
        /**
         * 仅用于State类型获取, 返回值总是undefined
         */
        __state_type__(): S;
        /**
         仅用于State类型属性获取, 返回值总是undefined
         */
        __state_type_key__(): keyof S;
    }
    type NamespaceT<T> = {
        State: (transfer: (prop: keyof T) => any) => VuexDecorator;
        Getter: (prop: keyof T) => VuexDecorator;
        Mutation: (prop: keyof T) => VuexDecorator;
        Action: (prop: keyof T) => VuexDecorator;
    };
    type NamespaceX = <T extends object>(store: vuex.ModuleX<T, any>) => vuex.NamespaceT<T>;
}
