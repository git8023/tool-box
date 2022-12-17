import { fns } from '../types/fns';
import { vuex } from '../types/types';
/**
 * @example
 * # 依赖条件
 * $ yarn add vuex
 * $ yarn add vuex-class
 */
export declare class StoreTools {
    /**
     * 提交同步操作
     * @param ctx 上下文
     * @param key typeof keyof MUTATIONS
     * @param payload 数据
     */
    static commit<T>(ctx: vuex.ActionContext<T>, key: (keyof T) | string, payload?: any): void;
    /**
     * 生成默认MUTATIONS，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateMutations<T extends object>(defineState: T): vuex.MutationTree<T>;
    /**
     * 生成默认actions，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateActions<T extends object>(defineState: T): vuex.ActionTree<T>;
    /**
     * 生成默认GETTERS，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateGetters<T extends object>(defineState: T): vuex.GetterTree<T, any>;
    /**
     * 生成Vuex实例
     *
     * @example
     * // ----------------------------
     * // file: store/mod/sys.ts
     * // ----------------------------
     * // 生成 Vuex.Module 规范对象
     * let sys = StoreTools.generate({
     *   token: '',
     *   resetTokenAction: null,
     * }, true, 'sys');
     * // 添加额外逻辑
     * sys = {
     *   ...sys,
     *   mutations: {
     *     ...sys.mutations,
     *     resetTokenAction: (state) => Jsons.clear(state)
     *   },
     *   actions: { ...sys.actions },
     *   getters: { ...sys.getters },
     * };
     * // 导出类型
     * export type SysT = ReturnType<typeof sys.__state_type__>;
     * export type SysP = ReturnType<typeof sys.__state_type_key__>;
     * // 导出对象
     * export { sys };
     *
     *
     * // ----------------------------
     * // file: store/index.ts
     * // ----------------------------
     *  export default createStore({
     *    modules: {
     *      [sys.__name__]: sys,
     *    },
     *  });
     *
     * @param og 状态对象或状态对象获取函数
     * @param [namespaced=true] 是否使用命名空间隔离
     * @param [name] 命名空间名称
     */
    static generate<T extends object>(og: fns.OrGetter<T>, namespaced?: boolean, name?: string): vuex.ModuleX<T, any>;
    /**
     * 给 BindingHelpers 添加参数类型提示
     * @param namespaced vuex.modules 注册的名称
     * @see namespace
     * @see namespaceX
     */
    static namespaceT<T extends object>(namespaced: string): vuex.NamespaceT<T>;
    /**
     * 从 Vuex.Module 实体获取命名空间注册名称, 并返回带类型 BindingHelpers。
     *
     * @example
     * // ----------------------------
     * // file: store/mod.ts
     * // ----------------------------
     * export class mod {
     *   // 手动指定类型
     *   static readonly sysMan = StoreTools.namespaceT<SysS>('sys');
     *   // 推导类型
     *   static readonly sysInfer = StoreTools.namespaceX(sys);
     * }
     *
     *
     * // ----------------------------
     * // file: views/System.vue
     * // ----------------------------
     * import { Vue } from 'vue-class-component';
     * export default System extends Vue {
     *   // 参数类型为 ReturnType<typeof sys.__state_type_key__>
     *   \@mod.sysMan.Getter('token') tokenMan!:string;
     *   // 参数类型为 ReturnType<typeof sysInfer.__state_type_key__>
     *   \@mod.sysInfer.Action('token') tokenInfer!:fns.Consume<string>;
     * }
     *
     * @function
     * @see StoreTools.generate
     */
    static readonly namespaceX: vuex.NamespaceX;
}
