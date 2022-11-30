import { vuex } from '../types/types';

/**
 * <h1>1. 定义模块</h1>
 * <pre>
 * import {
 *   ActionTree, GetterTree, Module, MutationTree,
 * } from 'vuex';
 * import { StoreTools, types } from '@hyong8023/tool-box';
 *
 * function getDefaultState() {
 *   return {
 *     token: '',
 *   };
 * }
 *
 * const state = getDefaultState();
 * type T = typeof state;
 *
 * class User implements Module<T, any> {
 *   namespaced = true;
 *   state = state;
 *   mutations: MutationTree<T> = { ...StoreTools.generateMutations(state) };
 *   actions: ActionTree<T, any> = { ...StoreTools.generateActions(state) };
 *   getters: GetterTree<T, any> = { ...StoreTools.generateGetters(state) };
 * }
 *
 * export type {UserMod} = T;
 * export type {UserModKey} = types.KeyOfOnly<UserMod>;
 * export const user = new User();
 * </pre>
 *
 * <p/>
 * <h1>2. 注册到vuex</h1>
 * <pre>
 * import { createStore } from 'vuex';
 * import system from '@/store/mod/user';
 *
 * export default createStore({
 *   modules: {
 *     user,
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
