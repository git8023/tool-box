import { vuex } from '../types/types';

/**
 * <h1>1. 定义模块</h1>
 * <pre>
 * import { ActionTree, GetterTree, Module, MutationTree } from 'vuex';
 * import StoreTools from '@/util/store-tools';
 *
 * // 数据结构
 * export interface ISystem {
 *   // 激活的菜单
 *   test: string,
 * }
 *
 * // 数据类型别名
 * type T = ISystem;
 *
 * // 获取默认状态
 * function getDefaultState(): T {
 *   return {
 *     test: undefined,
 *   };
 * }
 *
 * // 默认状态值
 * const state = getDefaultState();
 * class System implements Module<T, any> {
 *   namespaced = true;
 *   state = state;
 *   mutations: MutationTree<T> = {...StoreTools.generateMutations(state)};
 *   actions: ActionTree<T, any> = {...StoreTools.generateActions(state)};
 *   getters: GetterTree<T, any> = {...StoreTools.generateGetters(state)};
 * }

 * export default new System();
 * </pre>
 *
 * <p/>
 * <h1>2. 注册到vuex</h1>
 * <pre>
 * import { createStore } from 'vuex';
 * import system from '@/store/mod/system';
 *
 * export default createStore({
 *   modules: {
 *     system,
 *   },
 * });
 * </pre>
 */
export class StoreTools {

  /**
   * 提交同步操作
   * @param ctx 上下文
   * @param key typeof keyof MUTATIONS
   * @param payload 数据
   */
  static commit<T>(
    ctx: vuex.ActionContext<T>,
    key: (keyof T) | string,
    payload?: any,
  ) {
    ctx.commit(String(key), payload);
  }

  /**
   * 生成默认MUTATIONS，函数名为state属性名
   * @param defineState 必须定义所有属性值
   */
  static generateMutations<T extends object>(defineState: T): vuex.MutationTree<T> {
    const result: vuex.MutationTree<T> = {};
    Object.keys(defineState).forEach((key) => {
      result[key] = (
        state,
        payload,
      ) => state[key as keyof T] = payload;
    });
    return result;
  }

  /**
   * 生成默认actions，函数名为state属性名
   * @param defineState 必须定义所有属性值
   */
  static generateActions<T extends object>(defineState: T): vuex.ActionTree<T> {
    const result: vuex.ActionTree<T> = {};
    Object.keys(defineState).forEach((key) => {
      result[key] = (
        ctx,
        payload,
      ) => this.commit(ctx, key, payload);
    });
    return result;
  }

  /**
   * 生成默认GETTERS，函数名为state属性名
   * @param defineState 必须定义所有属性值
   */
  static generateGetters<T extends object>(defineState: T): vuex.GetterTree<T, any> {
    const result: vuex.GetterTree<T, any> = {};
    Object.keys(defineState).forEach((key) => {
      result[key] = (state) => state[key as keyof T];
    });
    return result;
  }

}
