import { vuex } from '../types/types';
/**
 * @example
 * // @file: store/mod/user.ts
 * // 定义通用状态类
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
 * export type User = T;
 * export type UserModKey = types.KeyOfOnly<UserMod>;
 * export const user = new User();
 *
 *
 * // @file: store/index.ts
 * // 注册到vuex
 * import { createStore } from 'vuex';
 * import system from '@/store/mod/user';
 *
 * export default createStore({
 *   modules: {
 *     user,
 *   },
 * });
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
}
