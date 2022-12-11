// @ts-ignore
import { Module } from 'vuex';
import { vuex } from '../../../src/types/types';
import { StoreTools } from '../../../src/tools/StoreTools';
import { types } from '../../../src/types/types';

function getDefaultState() {
  return { token: '', };
}

const state = getDefaultState();
type T = typeof state;

class UserStore implements Module<T, any> {
  namespaced = true;
  state = state;
  mutations: vuex.MutationTree<T> = { ...StoreTools.generateMutations(state) };
  actions: vuex.ActionTree<T, any> = { ...StoreTools.generateActions(state) };
  getters: vuex.GetterTree<T, any> = { ...StoreTools.generateGetters(state) };
}

export type SysState = T;
export type SysStateKey = types.KeyOfOnly<SysState>;
export const user = new UserStore();
