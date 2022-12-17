import { createStore } from 'vuex';
// @ts-ignore
import { sys } from './mod/sys2';

export default createStore({
  modules: {
    [sys.__name__]: sys,
  },
});
