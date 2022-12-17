import { StoreTools } from '../../../src/tools/StoreTools';

let sys = StoreTools.generate({
  token: ''
}, true, 'sys');

sys = {
  ...sys,
  mutations: { ...sys.mutations },
  actions: { ...sys.actions },
  getters: { ...sys.getters },
};

export type SysS = ReturnType<typeof sys.__state_type__>;
export type SysM = ReturnType<typeof sys.__state_type_key__>;
export { sys };
